import smartpy as sp


class QuoteDapp(sp.Contract):
    def __init__(self, owner_pk):
        self.init(currentQuote='Hello World', nonce=0, owner=owner_pk)

    @sp.entry_point
    def changeQuote(self, params):
        thingToSign = sp.pack(
            sp.record(o=params.newOwner, n=params.newQuote, c=self.data.nonce))
        sp.verify(sp.check_signature(params.newOwner,
                                     params.userSignature, thingToSign))
        self.data.currentQuote = params.newQuote
        self.data.owner = params.newOwner
        self.data.nonce = self.data.nonce + 1

# Tests


@sp.add_test(name="Quote Signature Checker")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Quote Updation SC with on-chain sig verification")
    first_owner = sp.test_account("Aniket")
    second_owner = sp.test_account("Sachin")

    # Let's display the accounts:
    scenario.h2("Accounts")
    scenario.show([first_owner, second_owner])

    c1 = QuoteDapp(first_owner.public_key)

    scenario += c1

    # Successful call:
    scenario.h2("Successful Call")
    scenario.p(
        "when the second owner is the signer and the pkh provided is also of the second_owner")
    first_message_packed = sp.pack(
        sp.record(o=second_owner.public_key, n="should work", c=0))
    sig_from_sachin = sp.make_signature(secret_key=second_owner.secret_key,
                                        message=first_message_packed,
                                        message_format="Raw")
    scenario += c1.changeQuote(newQuote="should work",
                               userSignature=sig_from_sachin,
                               newOwner=second_owner.public_key
                               ).run(valid=True)

    scenario.h2("Replay Attack")
    scenario.p(
        "Trying to reuse the same signature is blocked by the value of the nonce.")
    scenario += c1.changeQuote(newQuote="seems like a replay attack",
                               userSignature=sig_from_sachin,
                               newOwner=second_owner.public_key
                               ).run(valid=False)

    scenario.h2("Un-successful Call")
    scenario.p("when the second owner is the signer and the pkh provided is also of the first_owner, then in this case the call should fail")
    scenario += c1.changeQuote(newQuote="should not work",
                               userSignature=sig_from_sachin,
                               newOwner=first_owner.public_key
                               ).run(valid=False)
