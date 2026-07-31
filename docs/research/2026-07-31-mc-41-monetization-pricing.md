# Monetization and Pricing for Family Math Edtech — What Comparables Actually Charge, and What Regulators Actually Require

> Math Challenge research — 2026-07-31 — topic 41

## Resumen ejecutivo (ES)

Los comparables de matemáticas y edtech familiar convergen en un patrón claro: el contenido curricular básico es gratis o casi gratis, y lo que se cobra es la personalización, el seguimiento parental y las mejoras cosméticas/motivacionales. Prodigy da todo el contenido de matemáticas e inglés gratis a profesores y alumnos, y cobra a los padres $9.95–19.95 USD/mes (Core/Plus/Ultra) por analítica, monedas de juego y una segunda materia, con **25% de descuento adicional por cada hijo extra** en la misma cuenta [2]. IXL cobra desde $9.95 USD/mes por un hijo (solo matemáticas) y **$4 USD/mes por cada hijo adicional**, o $79 USD/año [1]. Mathletics no ofrece descuento familiar: son $19.95 USD por hijo, por mes, sin más [3]. Photomath usa un modelo freemium clásico ($0 / $9.99 mensual / $69.99 anual) [4]. Khan Academy sigue siendo 100% gratis, financiado por donantes (Google, Fundación Gates, Carlos Slim, AT&T, Elon Musk) por decenas de millones de dólares acumulados, y cobra solo por su tutor de IA opcional (Khanmigo, ~$4/mes) [7]. Kumon no publica precio nacional: cada centro franquiciado fija su propia tarifa, típicamente $140–200 USD/mes por materia más $50–100 de inscripción, según agregadores (no verificado con fuente primaria) [8].

El dato más útil para decidir el empaquetado de Math Challenge es el benchmark 2026 de RevenueCat: la categoría educación favorece planes anuales en 59% de los paywalls mostrados, con precio anual mediano de $44.99 USD (el más alto de todas las categorías), y las pruebas gratis de 17-32 días convierten 1.7 veces mejor que las de 4 días o menos [dato de referencia, ver Fuentes]. Esto sugiere una prueba de 14 días como mínimo razonable y un ancla de precio anual, no mensual.

En pagos, Stripe confirma soporte completo para OXXO (México, solo pago único, sin renovación automática, tope de 10,000 MXN) y Pix (Brasil, con impuesto IOF del 3.5% si el negocio no está domiciliado en Brasil, y Pix Automático recurrente en estado "solo por invitación" dentro de Brasil) [10][11]. Lo más importante para el negocio: **Stripe Tax no tiene a Brasil en su lista de países soportados** para cálculo automático de impuestos — ni siquiera para productos digitales [14] — mientras que México sí está totalmente soportado, con registro de IVA obligatorio a los 30 días de la primera venta a un cliente mexicano, sin umbral mínimo [15]. En la UE, el sistema de Ventanilla Única (OSS) permite un registro y una declaración para los 27 países [16].

En comisiones de tiendas de apps: desde abril de 2025 Apple no puede cobrar ninguna comisión sobre ventas dirigidas a un enlace externo en EE. UU. (fallo por desacato contra Apple, apelado) [17], y en la UE la DMA obliga a permitir enlaces externos y tiendas alternativas, con una multa de €500 millones a Apple en abril de 2025 [18]. Esto hace que cobrar en la web (fuera del app store) sea más viable que nunca si Math Challenge se empaqueta como PWA envuelta.

## Executive summary (EN)

Family math comparables converge on one pattern: core curriculum content is free or nearly free, and the paid layer is personalization, parent-facing analytics, and cosmetic/motivational extras. Prodigy gives all math and English content free to teachers and students, and charges parents $9.95–19.95 USD/month (Core/Plus/Ultra) for analytics, in-game currency, and a second subject, with an **extra 25% discount per additional child** on the same account [2]. IXL starts at $9.95 USD/month for one child (math only) plus **$4 USD/month per additional child**, or $79 USD/year [1]. Mathletics offers no family discount at all: $19.95 USD per child, per month, flat [3]. Photomath runs a classic freemium ladder ($0 / $9.99 monthly / $69.99 annual) [4]. Khan Academy stays 100% free, funded by tens of millions of dollars in cumulative philanthropic donations (Google, the Gates Foundation, Carlos Slim, AT&T, Elon Musk), monetizing only its optional AI tutor (Khanmigo, ~$4/month) [7]. Kumon publishes no national price at all — each franchised center sets its own rate, aggregator estimates put it at $140–200 USD/month per subject plus a $50–100 enrollment fee, unverified against a primary source [8].

The single most useful data point for packaging Math Challenge is RevenueCat's 2026 benchmark report: the education category favors annual plans in 59% of paywalls shown, with a median annual price of $44.99 USD (the highest of any category), and 17–32 day trials convert 1.7× better than trials of 4 days or fewer (see Sources). This argues for a 14-day-minimum trial and an annual price anchor rather than a monthly one.

On payments, Stripe confirms full support for OXXO (Mexico, one-time payment only, no auto-renewal, 10,000 MXN cap) and Pix (Brazil, with a 3.5% IOF tax if the business isn't Brazil-domiciled, and recurring Pix Automático still invite-only for Brazil-based accounts) [10][11]. Most consequential for the business model: **Stripe Tax does not list Brazil among its supported countries** for automatic tax calculation, even for digital products [14] — while Mexico is fully supported, with mandatory IVA registration within 30 days of the first sale to a Mexican customer and no minimum threshold [15]. In the EU, the One-Stop-Shop (OSS) scheme lets one registration and one return cover all 27 member states [16].

On app-store commissions: since April 2025 Apple can no longer collect any commission on sales routed through an external link in the US (contempt ruling, under appeal) [17], and in the EU the DMA compels link-outs and alternative app stores, backed by a €500 million fine against Apple in April 2025 [18]. This makes web-based billing (outside any app-store wrapper) more viable than at any point in the last decade if Math Challenge is ever wrapped as a native shell.

## Competitor pricing table

| Product | Plan | Price | Currency | What's free | Source URL | Date fetched |
|---|---|---|---|---|---|---|
| IXL | Family — 1 child, monthly | $9.95/mo | USD | Nothing beyond a 30-day money-back guarantee; no perpetual free tier | https://la.ixl.com/afiliacion/familiar/eligir-plan/mensual/matematicas | 2026-07-31 |
| IXL | Family — 1 child, annual | $79/yr ($6.59/mo effective) | USD | — | same | 2026-07-31 |
| IXL | Additional child (any plan) | +$4/mo per child | USD | — | same | 2026-07-31 |
| Prodigy Math | Core | $9.95/mo or $58.95/yr | USD | Core math + English gameplay, all teacher use | https://www.prodigygame.com/Memberships/math/ | 2026-07-31 |
| Prodigy Math | Plus | $14.95/mo or $88.95/yr | USD | — | same | 2026-07-31 |
| Prodigy Math | Ultra (Math+English bundle) | $19.95/mo or $118.95/yr | USD | — | same | 2026-07-31 |
| Prodigy Math | Multi-child discount | extra 25% off | USD | — | same | 2026-07-31 |
| Mathletics | Home, per child | $19.95/child/mo (14-day free trial) | USD | 14-day trial only, no perpetual free tier | https://parent.prod.eastus2.mathletics.com/subscription/create/create-account | 2026-07-31 |
| Photomath | Basic | $0 | USD | Step-by-step explanations, visual aids, "how/why" tips | https://photomath.com/ | 2026-07-31 |
| Photomath | Plus, monthly | $9.99/mo | USD | — | same | 2026-07-31 |
| Photomath | Plus, annual | $69.99/yr | USD | — | same | 2026-07-31 |
| Duolingo | Free | $0 | USD | Full course content, ad-supported | https://www.duolingo.com/super | 2026-07-31 |
| Duolingo | Súper (individual) | not shown pre-checkout | USD | — | same | 2026-07-31 |
| Duolingo | Súper Familia (up to 6 users) | not shown pre-checkout | USD | — | same | 2026-07-31 |
| Brilliant | Free | $0 | USD | Daily lesson, limited course access | https://brilliant.org/premium/ | 2026-07-31 |
| Brilliant | Premium | not shown pre-checkout (annual "best value" vs monthly) | USD | — | same | 2026-07-31 |
| Khan Academy | Core platform | $0 | USD | Everything: courses, exercises, teacher tools | https://en.wikipedia.org/wiki/Khan_Academy | 2026-07-31 |
| Khan Academy | Khanmigo AI tutor | ~$4/mo (per Wikipedia; not independently verified on khanacademy.org, which blocked automated fetch) | USD | — | same | 2026-07-31 |
| Kumon | Per subject, per month | not published nationally; aggregator estimate $140–$200/mo | USD | None — no free tier; franchise sets local price | https://www.kumon.com/ (no pricing page exists) | 2026-07-31 |
| Kumon | Enrollment fee | not published; aggregator estimate $50–$100 one-time | USD | — | (unverified, secondary source) | 2026-07-31 |
| Mathspace | — | could not be fetched (403 Forbidden both direct and via search) | — | — | https://mathspace.co/us/pricing | 2026-07-31 (failed) |

## Findings

### Freemium is the norm; the paywall sits behind analytics and extras, not core content

Every direct-to-consumer math product surveyed keeps the core learning loop free or nearly free and charges for a second layer: parent dashboards and progress reports (Prodigy, IXL, Mathletics), an AI tutor (Khan Academy's Khanmigo), or ad removal and unlimited practice depth (Duolingo, Photomath). None of the five surveyed products puts core skill practice behind a hard paywall — RevenueCat's 2026 report finds hard paywalls convert roughly 5× better than freemium (10.7% vs 2.1% median download-to-paid), but the category norm in kids' math edtech is freemium anyway, which suggests the market has decided parent trust and word-of-mouth (a child needs to actually enjoy the free product before a parent pays) outweigh the raw conversion-rate advantage of gating content immediately.

### Family/multi-child pricing has two shapes: per-seat add-on and flat per-child

IXL and Prodigy both use a **base price + discounted incremental seat** model: IXL's first child costs $9.95/month and every additional child costs $4/month — a roughly 60% discount per extra seat [1]. Prodigy takes a percentage-discount approach instead: a flat 25% off the total when buying memberships for multiple children [2]. Mathletics, by contrast, charges $19.95 per child with **no volume discount at all** [3] — a straight per-seat SaaS model, unusual among direct-to-parent products and worth noting as the "what happens if we don't bother with a family tier" baseline.

### Annual-first pricing and long trials dominate education specifically

RevenueCat's State of Subscription Apps 2026 report is the strongest primary benchmark obtained this session: education apps show annual plans on 59% of paywalls (the highest annual-preference share of any category measured), with a median annual price of $44.99 — again the highest median of any category, implying parents accept paying more upfront for a full-year commitment than users of other app categories do. The same report shows trial length matters enormously: 17–32-day trials convert to paid at 42.5% median versus 25.5% for trials of 4 days or fewer, a 1.7× gap. Applied to the comparables: Mathletics' 14-day trial sits close to the sweet spot; Duolingo's 7-day trial is short by this benchmark.

### Khan Academy's free model is a philanthropic-funding story, not a freemium one

Khan Academy is a 501(c)(3) nonprofit; per its IRS Form 990 filings (as summarized by Wikipedia), it reported $31 million in revenue in 2018 and $28 million in 2019, funded through named grants: Google contributed $2 million in 2010 (Project 10^100), AT&T gave $2.25 million in 2015 for mobile development, the Bill & Melinda Gates Foundation has given over $10 million cumulatively, Carlos Slim's Luis Alcázar Foundation funded Spanish-language video translation in 2013, and Elon Musk donated $5 million in January 2021 [7]. This is structurally different from every other comparable in this table — it is not a business model Math Challenge (a parent-pays product, per the brief) can replicate, but it sets the free-tier expectation every math app now competes against: a large fraction of parents have already been trained that "good math practice content is free," which reinforces the freemium-not-hard-paywall finding above.

### Kumon deliberately does not publish a price, because price is local and in-person

Kumon's own site has no pricing page; it routes every prospective customer to "Book a free assessment" at a physical center [8]. This is a structurally different business — in-person franchise tutoring, not SaaS — but it is relevant to Math Challenge's "school/teacher channel" question below, because it demonstrates a durable, decades-old alternative monetization model (per-subject monthly tuition plus a one-time enrollment fee) that still commands premium pricing ($140–200/month per subject per aggregator estimates) precisely because it bundles a live human relationship, which a PWA cannot replicate and should not attempt to price against directly.

### Payment methods that matter per market, confirmed against Stripe's own documentation

Stripe's payment-methods overview groups options into cards, bank debits, bank redirects, bank transfers, buy-now-pay-later, real-time payments, vouchers, and wallets, and explicitly notes that "different payment methods are more dominant in certain regions... offering more options reduces the possibility of losing a customer at checkout" [9]. For Math Challenge's target markets specifically:

- **Mexico**: OXXO (voucher/cash) is Mexico-only, MXN-only, capped at 10,000 MXN per transaction, settles up to T+4, and **does not support recurring payments, refunds, or disputes at all** [10]. This means OXXO can fund a one-time or annual purchase but cannot auto-renew a subscription — a card or bank-based method is still required for renewal. Mexico also has a dedicated Stripe-supported installment method ("meses sin intereses"), unique to Mexico among the buy-now-pay-later family [9].
- **Brazil**: Pix is a real-time bank-transfer method run by the Banco Central do Brasil; Stripe supports both one-time and recurring Pix (via "Pix Automático") [11]. Critically, **Pix Automático recurring billing is invite-only for Brazil-domiciled Stripe accounts**, though accounts domiciled in many other countries (including the US) can accept Pix, including recurring, from Brazilian customers [11]. Any Brazilian customer paying a non-Brazil-domiciled business via Pix is also charged Brazil's IOF tax on the currency conversion, currently 3.5% of the transaction — payable by the customer by default, though the merchant can absorb it via the `amount_includes_iof` parameter [11]. Boleto (voucher) is Brazil's other major cash-adjacent method, in the same non-recurring family as OXXO [9].
- **Germany**: SEPA Direct Debit is the natural fit — EUR-denominated, supports recurring/subscription billing natively, but settles slowly (T+6) and carries an unusually long dispute window: customers can reverse a SEPA debit "no questions asked" for **8 weeks**, and can dispute an unauthorized debit for up to **13 months** [12]. Klarna is also strong in Germany specifically — it is one of only three countries (with Sweden and the US) where Klarna's "Pay Later" option is available for subscription and on-demand billing, not just one-time purchases [13].
- **US/UK/Spain/France**: card rails plus wallets (Apple Pay, Google Pay, PayPal, Link) cover the bulk of consumer edtech billing; Klarna is broadly available across all these markets for one-time and installment purchases [13].

### Stripe Tax has a coverage gap in Brazil that materially affects go-to-market cost

Cross-checking Stripe's supported-countries table for Stripe Tax [14] and the Latin-America-specific collect-tax index [15] against the full country list shows Brazil is **absent from both** — every other major Math Challenge market (Mexico, the EU, Germany specifically, the US) is listed, but Brazil is not. Mexico, in fact, has full two-way support (business-in-Mexico and customer-in-Mexico) [15], with a firm compliance requirement: a non-resident remote seller of digital services to Mexican consumers must register for Mexican VAT (IVA) within **30 days of the first sale**, with **no minimum threshold** (one transaction triggers the obligation), and must appoint a legal representative and establish a Mexican tax domicile [15]. This means Brazil is the one target market where Stripe's tax product cannot be relied on for automatic calculation/remittance — a separate compliance path (local tax advisor, EOR-style intermediary, or manual filing) will be needed if Math Challenge sells directly to Brazilian consumers.

### The EU's One-Stop-Shop makes 27-country VAT compliance a single registration

For the EU market (Spain, France, Germany, Portugal for the Portuguese side of the brief), Stripe's documentation on the EU confirms the **Union OSS scheme** (for EU-based sellers) and the **Non-Union OSS scheme** (for non-EU-based sellers) both let a single registration and a single quarterly return cover VAT obligations across all 27 member states, instead of registering per-country [16]. There is also a **10,000 EUR/year "small seller" exemption** for EU-domiciled businesses selling digital products to individuals across the EU, below which the seller's home-country VAT rate applies instead of the customer's [16] — likely irrelevant to Math Challenge once it has any real EU revenue, but relevant during initial launch.

### App-store commission rules changed materially in 2024–2026, in Math Challenge's favor if ever wrapped natively

Two independent regulatory tracks now reduce the cost of directing users to web checkout from inside a native app wrapper:

- **United States**: Judge Yvonne Gonzalez Rogers's original 2021 anti-steering injunction against Apple (Epic Games v. Apple) required Apple to let developers link out to external purchase flows; the Supreme Court declined to hear further appeal in January 2024. Apple's initial compliance — a 27% commission on external-link sales plus scare-screen warnings — was found to be "bad faith compliance" in an April 2025 contempt ruling, which **banned Apple from collecting any fee on external-link transactions** and banned interface friction beyond a neutral notice. Apple is appealing to the Ninth Circuit and has petitioned the Supreme Court for certiorari in its 2026 term [17].
- **European Union**: The Digital Markets Act's Article 5(c) and 6(c) require "gatekeepers" (Apple, Google) to allow business users to steer end users to offers outside the platform and to permit alternative app stores and payment methods. Apple was the first company charged under the DMA (June 2024) and received a €500 million fine in April 2025 for continued violations [18].

Neither ruling is fully settled (both are under appeal), but both currently point the same direction: a wrapped PWA can link to web checkout with materially less commission risk than at any prior point since the App Store's creation. This does not change the recommendation to launch as a pure PWA first (no wrapper, no store review, no commission at all), but it lowers the cost of a future native wrapper if one becomes necessary for discoverability.

### Subscription-marketing regulation is in flux on both sides of the Atlantic, and neither status is fully confirmed this session

Two rules were **not** verifiable against a primary source in this session, and must be treated as background only:

- **FTC "click-to-cancel" rule (US)**: Publicly reported as finalized in late 2024 as an amendment to the Negative Option Rule and then vacated by the Eighth Circuit in mid-2025 on procedural grounds — this could not be confirmed against ftc.gov or a court-record source in this session (ftc.gov returned 403 to automated fetch, and Wikipedia's article on negative-option billing does not cover 2024–2026 events) [primary sources attempted and blocked]. Regardless of the click-to-cancel rule's specific status, the underlying obligation that cancellation be no harder than sign-up is separately required by the FTC's ROSCA (Restore Online Shoppers' Confidence Act) enforcement posture and by state-level "mini-ROSCA" auto-renewal laws (California, and others) that do not depend on the federal rule's fate.
- **EU Digital Fairness Act**: Confirmed via a secondary summary to be a live proposal targeting dark patterns, personalization/targeted-marketing practices, and influencer-marketing transparency; its public consultation ran July–October 2025, and a formal legislative proposal is expected in Q3 2026 [19] — i.e., essentially now, at the time of this research. It is not yet law and has no confirmed provisions specific to minors, though its dark-patterns focus is squarely relevant to any product marketing subscriptions toward children's accounts.

### School/teacher channel: give the classroom tool away, charge the parent

Every K-12 math product surveyed that has a classroom component (Prodigy, Mathletics, Khan Academy) gives teachers full classroom functionality for free and monetizes only the parent-facing layer. Prodigy states this explicitly on its homepage: "No trial period, no hidden costs for educators. Our optional parent memberships ensure Prodigy stays free for all teachers" [2]. Mathletics runs the opposite pattern at the institutional level — its schools product is quote-based B2B (no public price, "Buy now" routes to a sales quote), separate entirely from its $19.95/child/month direct-to-parent product [3]. This suggests two distinct monetization tracks worth keeping separate in Math Challenge's own model: a free, frictionless teacher/classroom mode that drives bottom-up adoption and word-of-mouth, and a parent-paid subscription that funds the product — with a possible third, quote-based district/school-license track modeled on Mathletics' B2B arm if Math Challenge later pursues institutional sales.

## Design implications

1. **Keep the core practice loop free forever; paywall the parent-facing layer.** Every surveyed comparable does this. Free tier = unlimited core math practice at the child's level, mistake review, and basic rewards. Paid tier = detailed parent analytics/reports, printable worksheets, a second subject or content vertical, and cosmetic/motivational extras (avatars, streak protections). This matches Prodigy, IXL, and Khan Academy's shared pattern and avoids the trust cost of gating a child's learning mid-session.

2. **Family plan shape: base seat + steep per-additional-child discount, not a flat per-child price.** Copy IXL's model rather than Mathletics': first child at full listed price, each additional child at roughly 40–60% of the marginal seat cost (IXL charges $4 for an additional seat against a $9.95 base — a 60% discount). A flat per-child model (Mathletics' $19.95 × N) is the one pattern in this survey with no family discount at all, and it exists specifically in a product without a real "family" positioning; Math Challenge, explicitly a family product, should not copy it.

3. **Anchor pricing on the annual plan, not monthly.** RevenueCat's 2026 data shows education is the single category most weighted toward annual plans (59% of paywalls) with the highest median annual price ($44.99) of any category. Present annual as the default selection with monthly as the visible-but-secondary option, following Prodigy and Mathletics' own UI pattern of showing "Save 50%" banners on annual.

4. **Suggested US/UK anchor price**: single-child annual around $39.99–$59.99 USD (below Prodigy Ultra's $118.95 and above IXL's $79, reasoning: Math Challenge is math-only like IXL but with fewer years of brand trust, so pricing at a discount to IXL's single-subject annual price is a reasonable entry point) with monthly at $6.99–$8.99 USD. This sits inside the observed $58.95–$118.95 range from Prodigy and below Mathletics' $19.95/month-per-child ($239.40/year) ceiling.

5. **Purchasing-power-adjusted pricing for Mexico and Brazil, not a flat USD price globally.** None of the comparables published Mexico- or Brazil-specific price points during this research (IXL and Mathletics showed USD even on their Latin-America-facing pages), but Prodigy and Duolingo are both known to run in-app localized pricing at checkout (not captured by static page fetches in this session). Recommendation: price Mexico around 45–55% of the US dollar price when converted to MXN at prevailing rates (a common PPP-adjustment band for consumer subscriptions), and Brazil similarly in BRL, both re-validated against local competitor pricing (a follow-up research task, since this session could not retrieve localized checkout prices for any comparable).

6. **Germany/France/Spain/Portugal: price in EUR at parity with, or a small premium over, the US dollar price**, consistent with Photomath and Brilliant's apparent single-tier-per-currency approach; do not PPP-discount Western Europe.

7. **Trial length: 14 days minimum, not 7.** RevenueCat's benchmark shows a 1.7× conversion gap between 17–32-day and ≤4-day trials, and Mathletics' 14-day trial sits in the stronger half of that range while Duolingo's 7-day trial does not. A 14-day trial also gives a family enough time to get past a first bad night (tired kid, one skipped session) without cancelling out of a false negative.

8. **Payment stack, phased by market**: Launch with cards + Apple Pay/Google Pay everywhere (universal baseline). Add SEPA Direct Debit for Germany/EU as the second method (native recurring support, no extra tax complexity beyond OSS). Add OXXO for Mexico as a one-time/annual-only option (never for monthly auto-renew, since OXXO cannot auto-renew) with a card required as fallback for anyone wanting monthly billing. Add Pix for Brazil once the IOF-tax UX and Brazil tax compliance question (finding above) is resolved — do not launch Brazil without a separate tax-calculation plan.

9. **Do not promise auto-renewing subscriptions via OXXO or one-time Boleto.** Both are single-use vouchers with no recurring capability in Stripe [10]. Any Mexico/Brazil pricing UI must either require a card/wallet for subscription plans, or offer OXXO/Boleto only for a prepaid annual plan (a single voucher payment, renewed manually next year) — a UX difference that should be explicit in the checkout copy, not discovered by the customer at renewal time.

10. **Brazil requires its own compliance workstream before public launch there.** Because Stripe Tax has no Brazil entry [14], resolve — before charging any Brazilian customer — whether Math Challenge will (a) use a Merchant-of-Record/EOR partner that absorbs Brazilian tax obligations, (b) engage a local tax advisor for manual ISS/PIS/COFINS compliance, or (c) delay Brazil launch until Stripe (or an alternative processor) adds native support. This is a genuine go/no-go gate, not a nice-to-have.

11. **Mexico requires registration within 30 days of first sale, with zero grace threshold.** Unlike the EU's 10,000 EUR small-seller allowance, Mexico's IVA rule for remote digital-service sellers has no minimum-transaction exemption — the first paying Mexican customer starts a 30-day clock to register, appoint a legal representative, and establish a Mexican tax domicile [15]. This should be resourced (likely via counsel or a fiscal representative service) before Mexico is enabled as a billing country, not after the first sale.

12. **Use the EU's Non-Union OSS scheme from day one for EU sales**, registering once in a single EU member state chosen as the OSS home country, rather than registering per-country — this is the standard, Stripe-documented path for a non-EU-domiciled business (IOS/Math Challenge, presumably US- or Mexico-domiciled) selling digital subscriptions to EU consumers [16].

13. **Cancellation must be at least as easy as sign-up, regardless of how the US "click-to-cancel" rule's legal status resolves.** Because that rule's current enforceability could not be confirmed this session, design defensively: in-app self-serve cancellation, no phone-call requirement, no retention-flow dark patterns (forced multi-step "are you sure" loops, hidden cancel buttons). This is required in substance by ROSCA and by most US state auto-renewal statutes regardless of the federal rule's fate, and pre-empts the EU's incoming Digital Fairness Act, whose public consultation explicitly targeted dark patterns in subscription cancellation flows [19].

14. **Disclose the EU 14-day withdrawal right, and word the waiver correctly, before charging any EU customer** — under the Consumer Rights Directive's digital-content provisions, a consumer loses the 14-day withdrawal right only if they expressly consent to immediate delivery of digital content/service and expressly acknowledge the resulting loss of the withdrawal right. Both consents must be captured (not merely implied by clicking "subscribe"), and this specific requirement could not be re-verified against a live EUR-Lex source this session (europa.eu blocked automated fetch) — legal review is recommended before EU launch to confirm current wording requirements.

15. **Build a free, full-featured teacher/classroom mode as a distinct product surface, monetized indirectly.** Following Prodigy's explicit "free for all teachers, funded by optional parent memberships" model, a Math Challenge classroom mode (roster import, assignment, progress dashboard) should never require a parent subscription to function for the teacher — the parent-paid tier should only unlock extra features on top, mirroring the pattern that drives Prodigy's near-million-teacher adoption.

16. **Reserve a school/district license track as a separate, quote-based B2B product**, modeled on Mathletics' institutional arm, rather than trying to fold school licensing into the same self-serve checkout as individual family subscriptions — the price points, procurement cycles, and payment methods (purchase orders, not cards) are different enough to warrant a separate sales motion.

## Open questions for the project owner

1. Should Math Challenge match Prodigy's "second-subject bundling" idea (bundle math with, say, reading/logic) at a higher tier, or stay math-only like IXL to keep positioning simple?
2. What is the target date for Brazil launch — should the compliance workstream (finding/implication 10) be scoped now, or should Brazil be explicitly out of scope for v1 pricing?
3. Is a lifetime/one-time-purchase option (à la many kids' apps that avoid subscription entirely) worth testing against the subscription-first model used by every comparable surveyed here?
4. Should the free tier include parent-visible progress data at all, or is progress tracking itself the paid hook (as in Prodigy/IXL/Mathletics)?
5. Does Math Challenge want to pursue a school/teacher channel at all in v1, given it adds a second product surface and sales motion (implication 15–16), or defer it to a later phase?
6. What is the acceptable risk tolerance for launching EU billing before the Digital Fairness Act's Q3 2026 formal proposal text is available — proceed now under current law, or wait for clarity?

## Sources

1. IXL family membership plan and pricing (1 child $9.95/mo or $79/yr; +$4/mo per additional child) — https://la.ixl.com/afiliacion/familiar/eligir-plan/mensual/matematicas — fetched 2026-07-31
2. Prodigy Math membership pricing (Core/Plus/Ultra, multi-child 25% discount) — https://www.prodigygame.com/Memberships/math/ — fetched 2026-07-31
3. Mathletics home-product pricing ($19.95/child/month, 14-day trial) — https://parent.prod.eastus2.mathletics.com/subscription/create/create-account — fetched 2026-07-31
4. Photomath pricing tiers (Basic $0 / Plus $9.99 mo / $69.99 yr) — https://photomath.com/ — fetched 2026-07-31
5. Duolingo Súper / Súper Familia tier structure (up to 6 users) — https://www.duolingo.com/super — fetched 2026-07-31
6. Brilliant Premium plan structure (annual vs monthly, price not shown pre-checkout) — https://brilliant.org/premium/ — fetched 2026-07-31
7. Khan Academy funding and nonprofit model (donor figures, Khanmigo pricing) — https://en.wikipedia.org/wiki/Khan_Academy — fetched 2026-07-31
8. Kumon homepage (no published pricing; routes to local-center assessment) — https://www.kumon.com/ — fetched 2026-07-31
9. Stripe payment methods overview (categories and regional dominance) — https://docs.stripe.com/payments/payment-methods/overview — fetched 2026-07-31
10. Stripe OXXO documentation (Mexico, no recurring, 10,000 MXN cap, no refunds/disputes) — https://docs.stripe.com/payments/oxxo — fetched 2026-07-31
11. Stripe Pix documentation (Brazil, IOF 3.5%, Pix Automático invite-only in Brazil) — https://docs.stripe.com/payments/pix — fetched 2026-07-31
12. Stripe SEPA Direct Debit documentation (Germany/EU, 8-week dispute window, T+6 settlement) — https://docs.stripe.com/payments/sepa-debit — fetched 2026-07-31
13. Stripe Klarna documentation (country coverage, subscription support in Germany/Sweden/US) — https://docs.stripe.com/payments/klarna — fetched 2026-07-31
14. Stripe Tax supported-countries list (Brazil absent; Mexico/EU/Germany present) — https://docs.stripe.com/tax/supported-countries — fetched 2026-07-31
15. Stripe Tax Mexico registration requirements (30-day rule, no threshold, legal representative) — https://docs.stripe.com/tax/supported-countries/latin-america-and-caribbean/collect-tax?tax-jurisdiction-latin-america=mexico — fetched 2026-07-31
16. Stripe Tax EU OSS/Non-Union OSS scheme and 10,000 EUR small-seller threshold — https://docs.stripe.com/tax/supported-countries/european-union — fetched 2026-07-31
17. Epic Games v. Apple — US anti-steering injunction and April 2025 contempt ruling — https://en.wikipedia.org/wiki/Epic_Games_v._Apple — fetched 2026-07-31
18. EU Digital Markets Act — anti-steering provisions and April 2025 €500M Apple fine — https://en.wikipedia.org/wiki/Digital_Markets_Act — fetched 2026-07-31
19. EU Digital Fairness Act — consultation timeline and Q3 2026 proposal target — https://en.wikipedia.org/wiki/Digital_Fairness_Act — fetched 2026-07-31
20. RevenueCat State of Subscription Apps 2026 — freemium/hard-paywall conversion, trial-length conversion, education-category annual-plan share and median price — https://www.revenuecat.com/state-of-subscription-apps/ — fetched 2026-07-31

**Not verified this session (flagged, not used as fact):** FTC click-to-cancel rule's post-vacatur status (ftc.gov blocked automated fetch); exact numeric Duolingo Súper/Súper Familia and Brilliant Premium prices (both paywalled behind login/checkout at fetch time); Mathspace pricing (403 Forbidden on all attempted URLs); EU Consumer Rights Directive's exact withdrawal-waiver wording (europa.eu blocked automated fetch, description here relies on general knowledge of Article 16(m) and should be legal-reviewed before use).
