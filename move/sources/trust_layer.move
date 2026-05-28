/// SuiShield Trust Layer — On-chain trust system for Sui ecosystem
/// Combines trust scores, scam reports, and analysis certificates
module suishield::trust_layer {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::String;
    use std::vector;

    // ═══ CONSTANTS ═══

    const LEVEL_SAFE: u8 = 0;
    const LEVEL_LOW: u8 = 1;
    const LEVEL_MEDIUM: u8 = 2;
    const LEVEL_HIGH: u8 = 3;

    const REPORT_RUG: u8 = 0;
    const REPORT_PHISHING: u8 = 1;
    const REPORT_FAKE: u8 = 2;
    const REPORT_OTHER: u8 = 3;

    const STATUS_PENDING: u8 = 0;
    const STATUS_VERIFIED: u8 = 1;
    const STATUS_DISPUTED: u8 = 2;

    const VERIFICATION_THRESHOLD: u64 = 3;

    // ═══ ERRORS ═══

    const E_NOT_AUTHORIZED: u64 = 0;
    const E_ALREADY_VERIFIED: u64 = 1;
    const E_ALREADY_REPORTED: u64 = 2;
    const E_REPORT_NOT_FOUND: u64 = 3;
    const E_SELF_VERIFICATION: u64 = 4;

    // ═══ OBJECTS ═══

    /// Global registry — shared object, anyone can read
    struct TrustLayer has key {
        id: UID,
        scores: Table<address, TrustScore>,
        reports: Table<ID, ScamReport>,
        address_reports: Table<address, vector<ID>>,
        total_analyses: u64,
        total_reports: u64,
        admin: address,
    }

    /// Trust score for a wallet
    struct TrustScore has store {
        wallet: address,
        score: u8,
        level: u8,
        analysis_blob: String,
        analyzed_by: address,
        timestamp: u64,
        update_count: u8,
    }

    /// Scam report
    struct ScamReport has store {
        reported_address: address,
        report_type: u8,
        evidence_blob: String,
        reporter: address,
        timestamp: u64,
        verifications: vector<address>,
        status: u8,
    }

    /// Analysis certificate NFT — owned by analyst
    struct AnalysisCertificate has key, store {
        id: UID,
        name: String,
        analyzed_address: address,
        trust_score: u8,
        level: u8,
        analysis_blob: String,
        analyst: address,
        timestamp: u64,
    }

    // ═══ EVENTS ═══

    struct AnalysisCreated has copy, drop {
        certificate_id: ID,
        analyzed_address: address,
        trust_score: u8,
        analyst: address,
    }

    struct ReportSubmitted has copy, drop {
        report_id: ID,
        reported_address: address,
        report_type: u8,
        reporter: address,
    }

    struct ReportVerified has copy, drop {
        report_id: ID,
        reported_address: address,
        verifier: address,
        total_verifications: u64,
    }

    struct ScoreUpdated has copy, drop {
        wallet: address,
        old_score: u8,
        new_score: u8,
    }

    // ═══ INIT ═══

    fun init(ctx: &mut TxContext) {
        let registry = TrustLayer {
            id: object::new(ctx),
            scores: table::new(ctx),
            reports: table::new(ctx),
            address_reports: table::new(ctx),
            total_analyses: 0,
            total_reports: 0,
            admin: tx_context::sender(ctx),
        };
        transfer::share_object(registry);
    }

    // ═══ ANALYZE WALLET ═══

    /// Analyze a wallet and create trust score + NFT certificate
    public fun analyze_wallet(
        registry: &mut TrustLayer,
        wallet: address,
        score: u8,
        level: u8,
        analysis_blob: String,
        ctx: &mut TxContext
    ): AnalysisCertificate {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Update or create trust score
        if (table::contains(&registry.scores, wallet)) {
            let old_score = table::borrow_mut(&mut registry.scores, wallet);
            let old_val = old_score.score;
            old_score.score = score;
            old_score.level = level;
            old_score.analysis_blob = analysis_blob;
            old_score.analyzed_by = sender;
            old_score.timestamp = timestamp;
            old_score.update_count = old_score.update_count + 1;

            event::emit(ScoreUpdated {
                wallet,
                old_score: old_val,
                new_score: score,
            });
        } else {
            let trust_score = TrustScore {
                wallet,
                score,
                level,
                analysis_blob,
                analyzed_by: sender,
                timestamp,
                update_count: 1,
            };
            table::add(&mut registry.scores, wallet, trust_score);
        };

        registry.total_analyses = registry.total_analyses + 1;

        // Mint certificate NFT
        let cert_id = object::new(ctx);
        let cert_id_for_event = object::uid_to_inner(&cert_id);

        let certificate = AnalysisCertificate {
            id: cert_id,
            name: b"SuiShield Analysis".to_string(),
            analyzed_address: wallet,
            trust_score: score,
            level,
            analysis_blob,
            analyst: sender,
            timestamp,
        };

        event::emit(AnalysisCreated {
            certificate_id: cert_id_for_event,
            analyzed_address: wallet,
            trust_score: score,
            analyst: sender,
        });

        certificate
    }

    // ═══ REPORT SCAM ═══

    /// Submit a scam report
    public fun submit_report(
        registry: &mut TrustLayer,
        reported_address: address,
        report_type: u8,
        evidence_blob: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Create report
        let report = ScamReport {
            reported_address,
            report_type,
            evidence_blob,
            reporter: sender,
            timestamp,
            verifications: vector::empty(),
            status: STATUS_PENDING,
        };

        // Generate report ID from table
        let report_id = object::id(&report);

        // Add to reports table
        table::add(&mut registry.reports, report_id, report);

        // Add to address's report list
        if (table::contains(&registry.address_reports, reported_address)) {
            let reports = table::borrow_mut(&mut registry.address_reports, reported_address);
            vector::push_back(reports, report_id);
        } else {
            let reports = vector::singleton(report_id);
            table::add(&mut registry.address_reports, reported_address, reports);
        };

        registry.total_reports = registry.total_reports + 1;

        // Auto-penalty trust score if exists
        if (table::contains(&registry.scores, reported_address)) {
            let score = table::borrow_mut(&mut registry.scores, reported_address);
            let penalty = if (score.score >= 15) 15 else score.score;
            score.score = score.score - penalty;
            score.level = calculate_level(score.score);
        };

        event::emit(ReportSubmitted {
            report_id,
            reported_address,
            report_type,
            reporter: sender,
        });
    }

    // ═══ VERIFY REPORT ═══

    /// Community verification of a scam report
    public fun verify_report(
        registry: &mut TrustLayer,
        report_id: ID,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        assert!(table::contains(&registry.reports, report_id), E_REPORT_NOT_FOUND);

        let report = table::borrow_mut(&mut registry.reports, report_id);
        assert!(report.reporter != sender, E_SELF_VERIFICATION);

        // Add verifier
        vector::push_back(&mut report.verifications, sender);

        // If threshold reached, mark as verified
        let verification_count = vector::length(&report.verifications);
        if (verification_count >= VERIFICATION_THRESHOLD && report.status == STATUS_PENDING) {
            report.status = STATUS_VERIFIED;

            // Additional trust score penalty
            if (table::contains(&registry.scores, report.reported_address)) {
                let score = table::borrow_mut(&mut registry.scores, report.reported_address);
                let penalty = if (score.score >= 10) 10 else score.score;
                score.score = score.score - penalty;
                score.level = calculate_level(score.score);
            };
        };

        event::emit(ReportVerified {
            report_id,
            reported_address: report.reported_address,
            verifier: sender,
            total_verifications: verification_count,
        });
    }

    // ═══ DISPUTE REPORT ═══

    /// Address owner dispute a false report
    public fun dispute_report(
        registry: &mut TrustLayer,
        report_id: ID,
        _counter_evidence: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        assert!(table::contains(&registry.reports, report_id), E_REPORT_NOT_FOUND);

        let report = table::borrow_mut(&mut registry.reports, report_id);
        assert!(report.reported_address == sender, E_NOT_AUTHORIZED);

        report.status = STATUS_DISPUTED;
    }

    // ═══ READ FUNCTIONS ═══

    /// Get trust score for a wallet
    public fun get_trust_score(
        registry: &TrustLayer,
        wallet: address
    ): (u8, u8, String, u64) {
        if (table::contains(&registry.scores, wallet)) {
            let score = table::borrow(&registry.scores, wallet);
            (score.score, score.level, score.analysis_blob, score.timestamp)
        } else {
            (50, LEVEL_MEDIUM, b"".to_string(), 0)
        }
    }

    /// Get report count for a wallet
    public fun get_report_count(
        registry: &TrustLayer,
        wallet: address
    ): u64 {
        if (table::contains(&registry.address_reports, wallet)) {
            vector::length(table::borrow(&registry.address_reports, wallet))
        } else {
            0
        }
    }

    /// Check if wallet has verified reports
    public fun has_verified_reports(
        registry: &TrustLayer,
        wallet: address
    ): bool {
        if (!table::contains(&registry.address_reports, wallet)) {
            return false
        };

        let report_ids = table::borrow(&registry.address_reports, wallet);
        let len = vector::length(report_ids);
        let i = 0;
        while (i < len) {
            let report_id = vector::borrow(report_ids, i);
            if (table::contains(&registry.reports, *report_id)) {
                let report = table::borrow(&registry.reports, *report_id);
                if (report.status == STATUS_VERIFIED) {
                    return true
                };
            };
            i = i + 1;
        };
        false
    }

    /// Get global stats
    public fun get_stats(registry: &TrustLayer): (u64, u64) {
        (registry.total_analyses, registry.total_reports)
    }

    // ═══ INTERNAL ═══

    fun calculate_level(score: u8): u8 {
        if (score < 25) { LEVEL_HIGH }
        else if (score < 50) { LEVEL_MEDIUM }
        else if (score < 75) { LEVEL_LOW }
        else { LEVEL_SAFE }
    }

    // ═══ TESTS ═══

    #[test]
    fun test_init() {
        use sui::test_scenario;

        let admin = @0xAD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        init(test_scenario::ctx(scenario));

        test_scenario::next_tx(scenario, admin);
        {
            let registry = test_scenario::take_shared<TrustLayer>(scenario);
            let (analyses, reports) = get_stats(&registry);
            assert!(analyses == 0, 0);
            assert!(reports == 0, 0);
            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario_val);
    }
}
