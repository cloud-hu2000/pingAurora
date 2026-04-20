export const metadata = {
  title: "Why We Built a Free Aurora Alert That Checks Cloud Cover for YOUR City",
  description:
    "Most aurora trackers show you the Kp index and call it a day. pingAurora does something different — it checks local cloud cover for your exact city before sending any alert. Here's why that matters.",
  openGraph: {
    title: "Why We Built a Free Aurora Alert That Checks Cloud Cover for YOUR City",
    description:
      "Most aurora trackers show you the Kp index and call it a day. pingAurora does something different — it checks local cloud cover for your exact city before sending any alert.",
    type: "article",
  },
};

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-aurora-dark text-aurora-text">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <p className="text-aurora-accent text-xs font-mono mb-4 tracking-widest uppercase">
          Behind the Product
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-aurora-text leading-snug mb-6">
          Why We Built a Free Aurora Alert That Checks Cloud Cover for{" "}
          <span className="text-aurora-accent">YOUR</span> City
        </h1>
        <p className="text-aurora-soft text-sm mb-2">April 20, 2026 · 6 min read</p>
        <hr className="border-aurora-glow/30 mb-12" />

        {/* Intro */}
        <p className="text-aurora-text leading-relaxed mb-6 text-base">
          If you have ever searched for an aurora borealis forecast, you have probably
          encountered a dozen apps and websites that all show the same thing: a number
          between 0 and 9, maybe a colored map, and a vague promise that tonight is a
          good night. You check it. You step outside. It is cloudy. You waited for nothing.
        </p>
        <p className="text-aurora-text leading-relaxed mb-6 text-base">
          We built pingAurora to solve exactly that problem — and a few others we think
          most existing tools get wrong.
        </p>

        {/* Problem 1 */}
        <h2 className="text-xl font-bold text-aurora-text mt-10 mb-4">
          Most aurora trackers ignore the most important variable
        </h2>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          The Kp index tells you how strong the geomagnetic activity is. That is useful.
          But it tells you nothing about whether you can actually{" "}
          <span className="text-aurora-accent">see</span> the sky. A Kp 7 storm hitting
          a city under thick cloud cover is still a wasted night.
        </p>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          Every other aurora app we tried only shows you the Kp index. None of them
          checked the weather at your location before telling you anything useful.
          So we made that the core of what pingAurora does.
        </p>

        {/* Feature 1 */}
        <div className="bg-aurora-deep border border-aurora-accent/30 rounded-2xl p-6 mb-10">
          <p className="text-aurora-accent text-xs font-semibold mb-2 tracking-widest uppercase">
            What pingAurora Does
          </p>
          <p className="text-aurora-text text-base leading-relaxed">
            Before sending any alert, pingAurora checks both the Kp index{" "}
            <span className="text-aurora-soft">and</span> the local cloud cover forecast
            for your specific city. You only get notified when both conditions are
            favorable — high enough solar activity{" "}
            <span className="text-aurora-soft">and</span> a clear enough sky to actually
            see something.
          </p>
        </div>

        {/* Problem 2 */}
        <h2 className="text-xl font-bold text-aurora-text mt-10 mb-4">
          No one else sends you a notification before it happens
        </h2>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          Every aurora app we know shows you current conditions. You have to open the
          app, look at the data, and make your own judgment call — usually after the
          optimal viewing window has already started. By the time you decide to go
          outside, get dressed, and drive somewhere dark, the best light show may already
          be fading.
        </p>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          We think the right experience is the opposite: the app watches the data, and
          you get a message hours before conditions become ideal. You wake up, check
          your phone, and know you should plan your evening around it.
        </p>

        {/* Feature 2 */}
        <div className="bg-aurora-deep border border-aurora-glow/40 rounded-2xl p-6 mb-10">
          <p className="text-aurora-accent text-xs font-semibold mb-2 tracking-widest uppercase">
            What pingAurora Does
          </p>
          <p className="text-aurora-text text-base leading-relaxed">
            pingAurora monitors conditions continuously and sends you an alert when
            conditions are projected to become favorable — not when they already are.
            You get hours of heads-up, not a snapshot of right now.
          </p>
        </div>

        {/* Problem 3 */}
        <h2 className="text-xl font-bold text-aurora-text mt-10 mb-4">
          Existing tools lock you into preset locations
        </h2>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          Most aurora apps let you pick from a short list of cities — maybe Fairbanks,
          Reykjavik, and Tromsø. If you live in Edinburgh, Montana, or northern Japan,
          you are out of luck. You get a notification for a city 400 km away that has
          completely different cloud cover than your backyard.
        </p>

        {/* Feature 3 */}
        <div className="bg-aurora-deep border border-aurora-glow/40 rounded-2xl p-6 mb-10">
          <p className="text-aurora-accent text-xs font-semibold mb-2 tracking-widest uppercase">
            What pingAurora Does
          </p>
          <p className="text-aurora-text text-base leading-relaxed">
            Type in your actual city — any city on Earth — and pingAurora pulls the
            weather forecast for your exact coordinates. The alert you get is for the sky
            above <span className="text-aurora-soft">your</span> location, not a city
            you have never been to.
          </p>
        </div>

        {/* Problem 4 */}
        <h2 className="text-xl font-bold text-aurora-text mt-10 mb-4">
          Alert fatigue is a real problem
        </h2>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          Solar activity tends to cluster. When a coronal mass ejection hits Earth, you
          might get alerts every few hours for three nights in a row. After the second
          one, you either start ignoring them or unsubscribe entirely — and then miss
          the third night that actually had a great show.
        </p>

        {/* Feature 4 */}
        <div className="bg-aurora-deep border border-aurora-glow/40 rounded-2xl p-6 mb-10">
          <p className="text-aurora-accent text-xs font-semibold mb-2 tracking-widest uppercase">
            What pingAurora Does
          </p>
          <p className="text-aurora-text text-base leading-relaxed">
            We cap alerts at one per subscriber every 6 hours, even if conditions stay
            favorable. You will never wake up to 12 notifications because a storm
            lingered. One clear signal is better than a dozen that train you to ignore
            all of them.
          </p>
        </div>

        {/* Problem 5 */}
        <h2 className="text-xl font-bold text-aurora-text mt-10 mb-4">
          We do not want your data, your attention, or your money
        </h2>
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          Free apps need to make money somehow. Most aurora apps fund themselves through
          ads, premium tiers, or selling your usage data. That means their incentive is
          to keep you opening the app — not to send you one perfect notification and
          nothing else.
        </p>
        <p className="text-aurora-text leading-relaxed mb-10 text-base">
          pingAurora has no ads, no premium features, and no data sales. It sends you
          a message when the data says go, and stays quiet the rest of the time. That
          is the entire business model.
        </p>

        {/* Closing */}
        <hr className="border-aurora-glow/30 mb-10" />
        <p className="text-aurora-text leading-relaxed mb-4 text-base">
          None of these ideas are complicated. They are just things we wish existed
          when we were standing outside in -10°C waiting for a show that never came
          because a cloud bank rolled in from the west.
        </p>
        <p className="text-aurora-text leading-relaxed mb-10 text-base">
          If that sounds useful to you,{" "}
          <a href="/" className="text-aurora-accent underline underline-offset-2">
            subscribe with your city
          </a>{" "}
          — it takes 30 seconds and costs nothing.
        </p>

        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center text-aurora-soft text-sm hover:text-aurora-accent transition-colors"
        >
          ← Back to pingAurora
        </a>
      </div>
    </main>
  );
}
