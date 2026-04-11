class AuditAgent:

    def record(self, snapshot, decision, action):
        print("\nAUDIT LOG")
        print("NFI:", snapshot.nfi)
        print("Decision:", decision.root_cause)
        print("Savings:", action.savings_inr_monthly)