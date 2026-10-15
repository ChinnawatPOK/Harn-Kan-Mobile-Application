import { useEffect, useState, type ReactNode } from "react";

type Screen =
  | "splash"
  | "login"
  | "signup"
  | "home"
  | "create"
  | "myDeals"
  | "myDealsHistory"
  | "deal"
  | "joinerDeal"
  | "reservedDeal"
  | "postPayment"
  | "completedDeal"
  | "refundDeal"
  | "profile"
  | "editProfile";
type IconName =
  | "arrow"
  | "back"
  | "bag"
  | "bell"
  | "camera"
  | "card"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "drink"
  | "food"
  | "home"
  | "location"
  | "minus"
  | "more"
  | "people"
  | "plus"
  | "profile"
  | "search"
  | "shield"
  | "star"
  | "ticket"
  | "warning"
  | "wallet";

const deals = [
  {
    id: 1,
    category: "Food",
    title: "Katsu & Co.",
    subtitle: "Japanese comfort food",
    price: "฿189",
    meta: "2 of 4 joined",
    distance: "350 m",
    time: "12 min",
    theme: "bg-pink-100",
    accent: "text-pink-700",
    initials: ["PL", "NR"],
  },
  {
    id: 2,
    category: "Drink",
    title: "Ari Coffee Club",
    subtitle: "Iced latte bottle set",
    price: "฿125",
    meta: "3 of 5 joined",
    distance: "600 m",
    time: "18 min",
    theme: "bg-pink-50",
    accent: "text-pink-600",
    initials: ["KA", "MO", "JI"],
  },
  {
    id: 3,
    category: "Food",
    title: "Weekend snack box",
    subtitle: "12 imported treats",
    price: "฿99",
    meta: "1 of 4 joined",
    distance: "1.2 km",
    time: "24 min",
    theme: "bg-pink-100",
    accent: "text-pink-800",
    initials: ["AN"],
  },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    back: <path d="m15 18-6-6 6-6" />,
    bag: (
      <>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="14" r="3.5" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    drink: (
      <>
        <path d="M6 5h11l-1 16H8L6 5Z" />
        <path d="m10 5 1-3h5M17 8h1a3 3 0 0 1 0 6h-2" />
      </>
    ),
    food: (
      <>
        <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" />
        <path d="M17 3v18M17 3c-3 2-3 8 0 9" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4" />
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    ticket: (
      <>
        <path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
        <path d="M13 9h3M13 15h3M8 9v6" />
      </>
    ),
    warning: (
      <>
        <path d="M10.3 4.4 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
        <path d="M15 11h7v5h-7a2.5 2.5 0 0 1 0-5Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}

function PigMascot({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 32 32" width={size}>
      <path
        className="fill-pink-300"
        d="M8 9 5 4c4-.2 6 1.2 7 3.2M24 9l3-5c-4-.2-6 1.2-7 3.2"
      />
      <path
        className="fill-pink-400"
        d="M16 6C8.8 6 4 10.8 4 17.2 4 23.4 8.7 27 16 27s12-3.6 12-9.8C28 10.8 23.2 6 16 6Z"
      />
      <circle className="fill-pink-950" cx="11.5" cy="15" r="1.3" />
      <circle className="fill-pink-950" cx="20.5" cy="15" r="1.3" />
      <ellipse className="fill-pink-200" cx="16" cy="20" rx="5" ry="3.8" />
      <circle className="fill-pink-800" cx="14.2" cy="20" r="0.8" />
      <circle className="fill-pink-800" cx="17.8" cy="20" r="0.8" />
    </svg>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "text-center"}>
      <div
        className={`flex items-center font-extrabold tracking-tight text-slate-950 ${compact ? "gap-1.5 text-xl" : "justify-center gap-2 text-4xl"}`}
      >
        <span
          className={`grid place-items-center rounded-full bg-pink-600 font-extrabold leading-none text-white shadow-sm shadow-pink-200 ${
            compact ? "size-7 text-lg" : "size-12 text-3xl"
          }`}
        >
          ÷
        </span>
        <span>KAN</span>
      </div>
      <div
        className={`flex items-center gap-1 text-slate-400 ${compact ? "mt-0.5 text-[8px]" : "mt-3 justify-center text-[10px]"}`}
      >
        <span className="font-bold uppercase tracking-wider">Powered by</span>
        <PigMascot size={compact ? 14 : 18} />
      </div>
    </div>
  );
}

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <button
      aria-label="Continue to login"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-6 text-center sm:min-h-[844px]"
      onClick={onContinue}
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-pink-500" />

      <span className="absolute left-10 top-1/3 size-3 rounded-full bg-pink-100" />
      <span className="absolute right-12 top-1/4 size-2 rounded-full bg-pink-200" />
      <span className="absolute bottom-1/3 left-14 size-2 rounded-full bg-white/40" />
      <span className="absolute bottom-1/4 right-10 size-3 rounded-full bg-white/30" />

      <div className="relative flex items-center gap-4 rounded-[2.5rem] border border-pink-100 bg-white px-7 py-5 shadow-2xl shadow-pink-950/15">
        <div className="flex h-24 w-16 shrink-0 flex-col items-center justify-center">
          <div className="relative size-10 rounded-full bg-pink-300 shadow-md shadow-pink-200">
            <span className="absolute -left-0.5 -top-1 size-4 -rotate-12 rounded-tl-full rounded-br-full bg-pink-400" />
            <span className="absolute -right-0.5 -top-1 size-4 rotate-12 rounded-tr-full rounded-bl-full bg-pink-400" />
            <span className="absolute left-1.5 top-4 size-2 rounded-full bg-pink-400/60" />
            <span className="absolute right-1.5 top-4 size-2 rounded-full bg-pink-400/60" />
            <span className="absolute left-2.5 top-3 size-1 rounded-full bg-pink-950" />
            <span className="absolute right-2.5 top-3 size-1 rounded-full bg-pink-950" />
            <span className="absolute bottom-1.5 left-1/2 flex h-3.5 w-5 -translate-x-1/2 items-center justify-center gap-1 rounded-full bg-pink-100">
              <span className="size-1 rounded-full bg-pink-500" />
              <span className="size-1 rounded-full bg-pink-500" />
            </span>
          </div>
          <div className="my-2 h-3 w-14 rounded-full bg-pink-500" />
          <div className="relative size-8 rounded-full border-[3px] border-pink-500 bg-pink-50">
            <span className="absolute inset-1 rounded-full border border-pink-200" />
            <span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold text-pink-600">
              ฿
            </span>
          </div>
        </div>

        <div className="flex items-center text-5xl font-extrabold tracking-tight text-slate-950">
          <span className="-rotate-3 text-pink-600">K</span>
          <span className="translate-y-1 rotate-2">A</span>
          <span className="-rotate-2 text-pink-600">N</span>
        </div>
      </div>

      <div className="absolute bottom-9 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
          Powered by
        </span>
        <span className="grid size-7 place-items-center rounded-full bg-white">
          <PigMascot size={21} />
        </span>
      </div>
    </button>
  );
}

function Avatar({
  label,
  tone = "bg-pink-200",
  size = "size-9",
}: {
  label: string;
  tone?: string;
  size?: string;
}) {
  return (
    <span
      className={`${size} ${tone} inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-extrabold text-slate-700`}
    >
      {label}
    </span>
  );
}

function TopBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className="flex h-16 items-center justify-between px-5">
      <div className="flex min-w-10 items-center">
        {onBack && (
          <button
            aria-label="Go back"
            className="grid size-10 place-items-center rounded-full bg-white text-slate-900 shadow-sm"
            onClick={onBack}
          >
            <Icon name="back" />
          </button>
        )}
      </div>
      <div className="text-base font-extrabold tracking-tight text-slate-950">
        {title}
      </div>
      <div className="flex min-w-10 justify-end">{action}</div>
    </header>
  );
}

function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const nav: { id: Screen; label: string; icon: IconName }[] = [
    { id: "home", label: "Explore", icon: "home" },
    { id: "create", label: "Create", icon: "plus" },
    { id: "myDeals", label: "My deals", icon: "ticket" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];

  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 flex h-20 items-start justify-around border-t border-slate-100 bg-white/95 px-2 pt-3 backdrop-blur">
      {nav.map((item) => {
        const active = screen === item.id;
        return (
          <button
            className={`group flex w-16 flex-col items-center gap-1 text-[10px] font-bold transition ${
              active ? "text-pink-700" : "text-slate-400"
            }`}
            key={item.id}
            onClick={() => setScreen(item.id)}
          >
            <span
              className={`grid h-8 w-11 place-items-center rounded-full transition ${
                active ? "bg-pink-100" : "group-hover:bg-slate-100"
              }`}
            >
              <Icon name={item.icon} size={19} />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function DealVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-pink-100 to-white ${
        compact ? "h-24 w-24 rounded-2xl" : "h-52 rounded-b-[2.5rem]"
      }`}
    >
      <div
        className={`absolute rounded-full bg-pink-300/70 ${
          compact ? "-right-4 top-2 size-14" : "-right-8 top-4 size-28"
        }`}
      />
      <div
        className={`absolute rounded-full bg-pink-200 ${
          compact ? "-left-3 bottom-0 size-10" : "left-4 bottom-3 size-20"
        }`}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={`relative grid place-items-center rounded-full bg-white shadow-xl ${
            compact ? "size-16" : "size-32"
          }`}
        >
          <div
            className={`rounded-full border-[6px] border-pink-50 bg-pink-500 ${compact ? "size-10" : "size-20"}`}
          >
            <div className="h-1/2 rounded-t-full bg-pink-200/70" />
            <div className="mx-auto mt-1 h-1.5 w-2/3 rounded-full bg-pink-700" />
            <div className="mx-auto mt-1 h-1.5 w-1/2 rounded-full bg-pink-300" />
          </div>
        </div>
      </div>
      {!compact && (
        <span className="absolute bottom-4 right-5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-slate-700 shadow-sm">
          <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />
          Pickup nearby
        </span>
      )}
    </div>
  );
}

function LoginScreen({
  onLogin,
  onSignUp,
}: {
  onLogin: () => void;
  onSignUp: () => void;
}) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 pb-8 pt-10 sm:min-h-[844px]">
      <div className="text-center">
        <BrandMark />
      </div>

      <div className="mt-12">
        <p className="text-3xl font-extrabold tracking-tight text-slate-950">
          Welcome back
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
          Login to discover deals and split purchases with people nearby.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            EMAIL OR PHONE NUMBER
          </span>
          <input
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            onChange={(event) => setIdentity(event.target.value)}
            placeholder="you@example.com"
            value={identity}
          />
        </label>

        <label className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700">
              PASSWORD
            </span>
            <button className="text-[10px] font-extrabold text-pink-600">
              Forgot password?
            </button>
          </div>
          <input
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
        </label>
      </div>

      <button
        className="mt-7 w-full rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
        onClick={onLogin}
      >
        Login
      </button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
          or continue with
        </span>
        <span className="h-px flex-1 bg-slate-100" />
      </div>

      <div className="space-y-3">
        <button
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-700 transition active:bg-slate-50"
          onClick={onLogin}
        >
          <span className="grid size-6 place-items-center rounded-full border border-slate-200 text-xs font-extrabold text-pink-600">
            G
          </span>
          Continue with Google
        </button>
      </div>

      <button
        className="mt-auto pt-8 text-center text-xs font-semibold text-slate-500"
        onClick={onSignUp}
      >
        Don&apos;t have an account?{" "}
        <span className="font-extrabold text-pink-600">Sign up</span>
      </button>
    </main>
  );
}

function SignUpScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 pb-8 pt-10 sm:min-h-[844px]">
      <BrandMark compact />

      <div className="mt-12">
        <p className="text-3xl font-extrabold tracking-tight text-slate-950">
          Create Account
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
          Start sharing deals and purchases with people nearby.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            FULL NAME
          </span>
          <input
            autoComplete="name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter your full name"
            value={fullName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            PHONE NUMBER
          </span>
          <input
            autoComplete="tel"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+66 81 234 5678"
            value={phone}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            PASSWORD
          </span>
          <input
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            type="password"
            value={password}
          />
        </label>
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <input
          checked={agreedToTerms}
          className="size-4 shrink-0 cursor-pointer accent-pink-600"
          id="terms-agreement"
          onChange={(event) => setAgreedToTerms(event.target.checked)}
          type="checkbox"
        />
        <p className="text-xs font-semibold text-slate-500">
          <label className="cursor-pointer" htmlFor="terms-agreement">
            I agree to the{" "}
          </label>
          <a
            className="font-extrabold text-pink-600 underline decoration-pink-300 underline-offset-2"
            href="#terms-and-conditions"
          >
            Terms and Conditions
          </a>
        </p>
      </div>

      <button
        className="mt-5 w-full rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
        onClick={() => setScreen("home")}
      >
        Sign Up
      </button>

      <button
        className="mt-auto pt-8 text-center text-xs font-semibold text-slate-500"
        onClick={() => setScreen("login")}
      >
        Already have an account?{" "}
        <span className="font-extrabold text-pink-600">Login</span>
      </button>
    </main>
  );
}

function HomeScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [filter, setFilter] = useState<"All" | "Food" | "Drink">("All");
  const filteredDeals =
    filter === "All" ? deals : deals.filter((deal) => deal.category === filter);

  return (
    <div className="pb-24">
      <div className="bg-white px-5 pb-4 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <BrandMark compact />
            <button className="mt-1 flex items-center gap-1 text-left text-lg font-extrabold text-slate-950">
              Ari, Bangkok <Icon name="chevron" size={15} />
            </button>
          </div>
          <button
            aria-label="Notifications"
            className="relative grid size-11 place-items-center rounded-full bg-slate-100 text-slate-700"
          >
            <Icon name="bell" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-slate-100 bg-pink-600" />
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3.5 text-slate-400">
          <Icon name="search" size={19} />
          <span className="text-sm font-semibold">Search nearby deals</span>
        </div>
        <div className="mt-3 flex gap-2">
          {(["All", "Food", "Drink"] as const).map((item) => {
            const selected = filter === item;
            return (
              <button
                aria-pressed={selected}
                className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                  selected
                    ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                    : "bg-pink-50 text-pink-700"
                }`}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <section className="px-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-extrabold text-slate-950">Nearby</p>
          <button className="text-xs font-bold text-slate-500">See all</button>
        </div>

        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <button
              className="flex w-full items-center gap-3 rounded-3xl bg-white p-3 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition active:scale-[0.98]"
              key={deal.id}
              onClick={() => setScreen("joinerDeal")}
            >
              <div
                className={`${deal.theme} grid size-20 shrink-0 place-items-center rounded-2xl ${deal.accent}`}
              >
                <Icon
                  name={deal.category === "Drink" ? "drink" : "food"}
                  size={29}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                  <Icon name="clock" size={12} /> {deal.time} left
                </div>
                <div className="mt-1 truncate text-[15px] font-extrabold text-slate-950">
                  {deal.title}
                </div>
                <div className="truncate text-xs font-medium text-slate-400">
                  {deal.subtitle}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {deal.initials.map((initial) => (
                      <Avatar key={initial} label={initial} size="size-6" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {deal.meta}
                  </span>
                </div>
              </div>
              <div className="self-stretch border-l border-slate-100 pl-3 text-right">
                <div className="text-sm font-extrabold text-slate-950">
                  {deal.price}
                </div>
                <div className="mt-1 text-[9px] font-semibold text-slate-400">
                  per person
                </div>
                <div className="mt-6 flex items-center justify-end gap-0.5 text-[9px] font-bold text-slate-400">
                  <Icon name="location" size={11} /> {deal.distance}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function CreateScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [people, setPeople] = useState(4);
  const [name, setName] = useState("Family-sized pizza bundle");
  const [price, setPrice] = useState("760");
  const [category, setCategory] = useState("Food");
  const [pickupLocation, setPickupLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [details, setDetails] = useState("");
  const [expiresIn, setExpiresIn] = useState("30 minutes");
  const perPerson = price && people ? Math.ceil(Number(price) / people) : 0;
  const categories = ["Food", "Drink"];

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported on this device.");
      return;
    }

    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPickupLocation(
          `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        );
        setIsLocating(false);
      },
      () => {
        setLocationError(
          "We couldn't access your location. Enter it manually instead.",
        );
        setIsLocating(false);
      },
    );
  };

  return (
    <div className="pb-28">
      <TopBar title="Create a deal" />
      <main className="px-5 pt-2">
        <div className="mb-7">
          <p className="text-sm font-semibold text-slate-400">
            Start a group purchase
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
            What are we sharing?
          </p>
        </div>

        <label className="mb-5 block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            DEAL NAME
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-pink-400">
            <span className="text-pink-600">
              <Icon name="bag" />
            </span>
            <input
              className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Pizza bundle"
              value={name}
            />
            {name && (
              <button
                aria-label="Clear item name"
                className="text-slate-300"
                onClick={() => setName("")}
              >
                <Icon name="close" size={17} />
              </button>
            )}
          </div>
        </label>

        <div className="mb-5">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            CATEGORY
          </span>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {categories.map((item) => {
              const selected = category === item;
              return (
                <button
                  aria-pressed={selected}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-extrabold transition ${
                    selected
                      ? "bg-pink-700 text-white shadow-md shadow-pink-100"
                      : "border border-slate-200 bg-white text-slate-500"
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <label
            className="mb-2 block text-xs font-extrabold text-slate-700"
            htmlFor="pickup-location"
          >
            PICKUP LOCATION
          </label>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-50">
            <input
              className="min-w-0 flex-1 bg-transparent py-4 pr-2 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
              id="pickup-location"
              onChange={(event) => {
                setPickupLocation(event.target.value);
                setLocationError("");
              }}
              placeholder="Enter pickup location"
              value={pickupLocation}
            />
            <button
              className="flex shrink-0 items-center gap-1.5 border-l border-pink-100 py-1 pl-3 text-[11px] font-extrabold text-pink-600 transition hover:text-pink-700 disabled:cursor-wait disabled:opacity-60"
              disabled={isLocating}
              onClick={useCurrentLocation}
              type="button"
            >
              <Icon name="location" size={15} />
              {isLocating ? "Locating..." : "Use current location"}
            </button>
          </div>
          {locationError && (
            <p
              aria-live="polite"
              className="mt-2 text-xs font-semibold text-pink-700"
            >
              {locationError}
            </p>
          )}
        </div>

        <label className="mb-5 block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            DEAL DETAILS (OPTIONAL)
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Add pickup location or specific menu notes"
            rows={3}
            value={details}
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            TOTAL PRICE (฿)
          </span>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-pink-400">
            <span className="mr-3 text-lg font-extrabold text-slate-400">
              ฿
            </span>
            <input
              className="min-w-0 flex-1 bg-transparent py-4 text-lg font-extrabold text-slate-900 outline-none"
              inputMode="numeric"
              onChange={(event) =>
                setPrice(event.target.value.replace(/\D/g, ""))
              }
              value={price}
            />
            <span className="text-xs font-bold text-slate-400">THB</span>
          </div>
        </label>

        <div className="mb-6">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            NUMBER OF PARTICIPANTS
          </span>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              aria-label="Remove participant"
              className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40"
              disabled={people <= 2}
              onClick={() => setPeople((value) => Math.max(2, value - 1))}
            >
              <Icon name="minus" size={18} />
            </button>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-slate-950">
                {people}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                people
              </div>
            </div>
            <button
              aria-label="Add participant"
              className="grid size-11 place-items-center rounded-xl bg-pink-100 text-pink-700 disabled:opacity-40"
              disabled={people >= 4}
              onClick={() => setPeople((value) => Math.min(4, value + 1))}
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-extrabold text-slate-700">
            DEAL EXPIRES IN
          </span>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-12 text-sm font-extrabold text-slate-900 shadow-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
              onChange={(event) => setExpiresIn(event.target.value)}
              value={expiresIn}
            >
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-pink-600">
              <Icon name="chevron" size={17} />
            </span>
          </div>
        </label>

        <div className="mb-7 flex items-center gap-3 rounded-2xl bg-pink-50 p-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-pink-600 text-white">
            <Icon name="people" size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-pink-500">EACH PERSON PAYS</p>
            <p className="text-xl font-extrabold text-pink-950">
              ฿{perPerson.toLocaleString()}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-pink-600">
            Even split
          </span>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-700 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98] disabled:opacity-50"
          disabled={!name || !price}
          onClick={() => setScreen("deal")}
        >
          Create Deal <Icon name="arrow" size={18} />
        </button>
      </main>
    </div>
  );
}

function MyDealsScreen({
  setScreen,
  initialTab = "joined",
}: {
  setScreen: (screen: Screen) => void;
  initialTab?: "created" | "joined" | "history";
}) {
  const [tab, setTab] = useState<"created" | "joined" | "history">(initialTab);
  const [createdCategory, setCreatedCategory] = useState<
    "All" | "Food" | "Drink"
  >("All");
  const [joinedCategory, setJoinedCategory] = useState<
    "All" | "Food" | "Drink"
  >("All");
  const [historyCategory, setHistoryCategory] = useState<
    "All" | "Food" | "Drink"
  >("All");
  const [historyRole, setHistoryRole] = useState<
    "All Roles" | "Creator" | "Participant"
  >("All Roles");
  const [historyStatus, setHistoryStatus] = useState<
    "All Status" | "Completed" | "Canceled" | "Expired"
  >("All Status");
  const createdDeals = [
    {
      name: "Katsu & Co. group order",
      category: "Food",
      price: "฿756",
      date: "Today, 12:30",
      status: "Waiting",
      role: "Creator",
    },
    {
      name: "Friday bubble tea run",
      category: "Drink",
      price: "฿420",
      date: "Today, 16:45",
      status: "Ready to Order",
      role: "Creator",
    },
    {
      name: "Office lunch bundle",
      category: "Food",
      price: "฿1,280",
      date: "18 Jun, 11:00",
      status: "Waiting",
      role: "Creator",
    },
    {
      name: "Cold brew bottle set",
      category: "Drink",
      price: "฿640",
      date: "Today, 17:30",
      status: "Ready to Order",
      role: "Creator",
    },
  ];
  const joinedDeals = [
    {
      name: "Pizza night bundle",
      category: "Food",
      price: "฿920",
      date: "Today, 18:30",
      status: "Paid",
      role: "Participant",
    },
    {
      name: "Matcha latte delivery",
      category: "Drink",
      price: "฿360",
      date: "Today, 19:00",
      status: "Reserved",
      role: "Participant",
    },
    {
      name: "Weekend snack box",
      category: "Food",
      price: "฿396",
      date: "Tomorrow, 14:15",
      status: "Waiting for Host",
      role: "Participant",
    },
    {
      name: "Fresh juice pack",
      category: "Drink",
      price: "฿520",
      date: "Tomorrow, 08:30",
      status: "Paid",
      role: "Participant",
    },
  ];
  const historyDeals = [
    {
      name: "Katsu & Co. group order",
      category: "Food",
      price: "฿756",
      date: "18 Jun, 12:30",
      status: "Completed",
      role: "Creator",
    },
    {
      name: "Ari Coffee Club",
      category: "Drink",
      price: "฿500",
      date: "15 Jun, 09:15",
      status: "Completed",
      role: "Participant",
    },
    {
      name: "Sunday pizza bundle",
      category: "Food",
      price: "฿880",
      date: "9 Jun, 18:40",
      status: "Canceled",
      role: "Creator",
    },
    {
      name: "Matcha bottle set",
      category: "Drink",
      price: "฿420",
      date: "2 Jun, 14:20",
      status: "Expired",
      role: "Participant",
    },
  ];
  const filteredCreatedDeals = createdDeals.filter(
    (deal) => createdCategory === "All" || deal.category === createdCategory,
  );
  const filteredJoinedDeals = joinedDeals.filter(
    (deal) => joinedCategory === "All" || deal.category === joinedCategory,
  );
  const filteredHistoryDeals = historyDeals.filter(
    (deal) =>
      (historyCategory === "All" || deal.category === historyCategory) &&
      (historyRole === "All Roles" || deal.role === historyRole) &&
      (historyStatus === "All Status" || deal.status === historyStatus),
  );
  const dealsToShow =
    tab === "created"
      ? filteredCreatedDeals
      : tab === "joined"
        ? filteredJoinedDeals
        : filteredHistoryDeals;

  const statusStyle: Record<string, string> = {
    Waiting: "bg-amber-50 text-amber-700",
    Paid: "bg-emerald-50 text-emerald-700",
    Closed: "bg-slate-100 text-slate-500",
    "Ready to Order": "bg-pink-100 text-pink-700",
    Reserved: "bg-orange-50 text-orange-700",
    "Waiting for Host": "bg-pink-100 text-pink-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Canceled: "bg-red-50 text-red-600",
    Expired: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="pb-28">
      <TopBar title="My Deals" />
      <main className="px-5 pt-3">
        <div className="grid grid-cols-3 rounded-2xl bg-pink-50 p-1">
          {(["created", "joined", "history"] as const).map((item) => {
            const selected = tab === item;
            return (
              <button
                aria-pressed={selected}
                className={`rounded-xl py-3 text-xs font-extrabold capitalize transition ${
                  selected
                    ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                    : "text-pink-700"
                }`}
                key={item}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="mb-4 mt-6 flex items-end justify-between">
          <div>
            <p className="text-xl font-extrabold tracking-tight text-slate-950">
              {tab === "created"
                ? "Active Deals You Host"
                : tab === "joined"
                  ? "Active Deals You Joined"
                  : "Past Deals"}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {tab === "history"
                ? `${dealsToShow.length} past deals`
                : `${dealsToShow.length} active and recent deals`}
            </p>
          </div>
          {tab !== "history" &&
            (tab === "created" ? (
              <button
                aria-label="Create a new deal"
                className="grid size-9 place-items-center rounded-full bg-pink-100 text-pink-700 transition active:scale-95"
                onClick={() => setScreen("create")}
              >
                <Icon name="plus" size={17} />
              </button>
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-pink-100 text-pink-700">
                <Icon name="people" size={17} />
              </span>
            ))}
        </div>

        {tab === "created" && (
          <div className="-mx-5 mb-5 overflow-x-auto px-5 pb-1">
            <div className="flex w-max gap-2">
              {(["All", "Food", "Drink"] as const).map((item) => (
                <button
                  aria-pressed={createdCategory === item}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                    createdCategory === item
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                      : "border border-pink-100 bg-white text-pink-700"
                  }`}
                  key={item}
                  onClick={() => setCreatedCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "joined" && (
          <div className="-mx-5 mb-5 overflow-x-auto px-5 pb-1">
            <div className="flex w-max gap-2">
              {(["All", "Food", "Drink"] as const).map((item) => (
                <button
                  aria-pressed={joinedCategory === item}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                    joinedCategory === item
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                      : "border border-pink-100 bg-white text-pink-700"
                  }`}
                  key={item}
                  onClick={() => setJoinedCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="-mx-5 mb-5 overflow-x-auto px-5 pb-1">
            <div className="flex w-max items-center gap-2">
              {(["All", "Food", "Drink"] as const).map((item) => (
                <button
                  aria-pressed={historyCategory === item}
                  className={`rounded-full px-3.5 py-2 text-[10px] font-extrabold transition ${
                    historyCategory === item
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                      : "border border-pink-100 bg-white text-pink-700"
                  }`}
                  key={`category-${item}`}
                  onClick={() => setHistoryCategory(item)}
                >
                  {item}
                </button>
              ))}
              <span className="mx-1 h-6 w-px bg-pink-100" />
              {(["All Roles", "Creator", "Participant"] as const).map(
                (item) => (
                  <button
                    aria-pressed={historyRole === item}
                    className={`rounded-full px-3.5 py-2 text-[10px] font-extrabold transition ${
                      historyRole === item
                        ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                        : "border border-pink-100 bg-white text-pink-700"
                    }`}
                    key={`role-${item}`}
                    onClick={() => setHistoryRole(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <span className="mx-1 h-6 w-px bg-pink-100" />
              {(
                ["All Status", "Completed", "Canceled", "Expired"] as const
              ).map((item) => (
                <button
                  aria-pressed={historyStatus === item}
                  className={`rounded-full px-3.5 py-2 text-[10px] font-extrabold transition ${
                    historyStatus === item
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                      : "border border-pink-100 bg-white text-pink-700"
                  }`}
                  key={`status-${item}`}
                  onClick={() => setHistoryStatus(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {dealsToShow.map((deal, index) => (
            <button
              className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition active:scale-[0.98]"
              key={deal.name}
              onClick={() => {
                if (tab === "history") {
                  if (deal.status === "Completed") setScreen("completedDeal");
                  if (deal.status === "Canceled" || deal.status === "Expired")
                    setScreen("refundDeal");
                } else if (deal.status === "Closed") {
                  setScreen("completedDeal");
                } else if (tab === "created") {
                  setScreen("deal");
                } else {
                  setScreen(
                    deal.status === "Reserved"
                      ? "reservedDeal"
                      : deal.status === "Paid" ||
                          deal.status === "Waiting for Host"
                        ? "postPayment"
                        : "joinerDeal",
                  );
                }
              }}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pink-50 text-pink-600">
                  <Icon
                    name={deal.category === "Food" ? "food" : "ticket"}
                    size={21}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-extrabold text-slate-950">
                      {deal.name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold ${statusStyle[deal.status]}`}
                    >
                      {deal.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold">
                    <span className="rounded-full bg-pink-100 px-2 py-1 text-pink-700">
                      {deal.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                      Role: {deal.role}
                    </span>
                    <span className="text-slate-400">{deal.date}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Price
                </span>
                <span className="text-base font-extrabold text-slate-950">
                  {deal.price}
                </span>
              </div>
              {index === 0 && tab === "created" && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-pink-600">
                  <Icon name="people" size={13} /> 3 of 4 participants ready
                </div>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");
  const progress = Math.max(0, (seconds / 900) * 100);

  return (
    <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-full bg-white/10 text-amber-300">
          <Icon name="clock" size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Deal Expires In
          </p>
          <p className="mt-0.5 font-mono text-2xl font-bold tracking-wider">
            {minutes}:{rest}
          </p>
        </div>
        <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          Reserved
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-300 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function DealScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [dealSeconds, setDealSeconds] = useState(900);
  const [paymentSeconds, setPaymentSeconds] = useState(300);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDealSeconds((value) => (value > 0 ? value - 1 : 0));
      setPaymentSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const paymentCountdown = `${String(Math.floor(paymentSeconds / 60)).padStart(2, "0")}:${String(paymentSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="pb-28">
      <div className="relative">
        <DealVisual />
        <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-5">
          <button
            aria-label="Go home"
            className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur"
            onClick={() => setScreen("myDeals")}
          >
            <Icon name="back" />
          </button>
          <button
            aria-label="More options"
            className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur"
          >
            <Icon name="more" />
          </button>
        </div>
      </div>

      <main className="-mt-5 relative z-10 rounded-t-[2rem] bg-white px-5 pt-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pink-700">
              Food
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Katsu & Co. group order
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Chicken katsu set + gyoza bundle
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-extrabold text-slate-950">฿756</div>
            <div className="text-[10px] font-bold text-slate-400">
              TOTAL PRICE
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1">
            <Icon name="location" size={15} /> 350 m away
          </span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>Pickup at 12:30</span>
        </div>

        <Timer seconds={dealSeconds} />

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-slate-950">The group</p>
            <span className="text-xs font-bold text-slate-400">
              4 participant slots
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-3.5">
              <Avatar label="YO" size="size-10" tone="bg-pink-200" />
              <div className="flex-1">
                <div className="text-sm font-extrabold text-slate-900">
                  Host (You)
                </div>
                <div className="text-[10px] font-semibold text-slate-400">
                  Slot 1 · Deal creator
                </div>
              </div>
              <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-extrabold text-pink-700">
                No payment
              </span>
            </div>
            {[
              { slot: 2, name: "Narin K.", initials: "NR", paid: true },
              { slot: 3, name: "Anya P.", initials: "AP", paid: true },
              { slot: 4, name: "Mook J.", initials: "MJ", paid: false },
            ].map((person) => (
              <div
                className="flex items-center gap-3 border-b border-slate-100 p-3.5 last:border-0"
                key={person.slot}
              >
                <Avatar
                  label={person.initials}
                  size="size-10"
                  tone="bg-pink-100"
                />
                <div className="flex-1">
                  <div className="text-sm font-extrabold text-slate-900">
                    {person.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Slot {person.slot} · ฿252 share
                  </div>
                </div>
                {person.paid ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                    <Icon name="check" size={11} /> Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                    <Icon name="clock" size={11} /> {paymentCountdown}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-emerald-800">
          <Icon name="shield" size={18} />
          <p className="text-[10px] font-bold">
            You are the creator and do not pay in the app. Participant payments
            are held securely.
          </p>
        </div>

        <button
          className="mt-5 w-full py-4 text-xs font-extrabold text-red-600"
          onClick={() => setShowCancelModal(true)}
        >
          Cancel Deal
        </button>
      </main>

      {showCancelModal && (
        <div
          aria-describedby="cancel-deal-description"
          aria-labelledby="cancel-deal-title"
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-5 backdrop-blur-md"
          onClick={() => setShowCancelModal(false)}
          role="dialog"
        >
          <div
            className="w-full rounded-[2rem] border border-red-100 bg-white p-6 text-center shadow-2xl shadow-red-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60">
              <Icon name="warning" size={29} />
            </div>
            <p
              className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950"
              id="cancel-deal-title"
            >
              Cancel this deal?
            </p>
            <p
              className="mt-3 text-sm font-medium leading-6 text-slate-500"
              id="cancel-deal-description"
            >
              Are you sure you want to cancel this group order? Any participants
              who have already paid will be fully refunded automatically. This
              action cannot be undone.
            </p>
            <div className="mt-7 space-y-3">
              <button
                className="w-full rounded-2xl bg-red-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-red-200 transition active:scale-[0.98]"
                onClick={() => setScreen("refundDeal")}
              >
                Yes, Cancel Deal
              </button>
              <button
                className="w-full rounded-2xl border-2 border-pink-200 bg-white py-3.5 text-sm font-extrabold text-pink-700 transition active:bg-pink-50"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JoinerDealScreen({
  setScreen,
  reserved = false,
}: {
  setScreen: (screen: Screen) => void;
  reserved?: boolean;
}) {
  const [seconds, setSeconds] = useState(reserved ? 299 : 300);
  const [dealExpirySeconds, setDealExpirySeconds] = useState(886);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(
      () => setDealExpirySeconds((value) => (value > 0 ? value - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showCheckout && !reserved) return;
    const interval = window.setInterval(
      () => setSeconds((value) => (value > 0 ? value - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(interval);
  }, [reserved, showCheckout]);

  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const dealExpiryCountdown = `${String(Math.floor(dealExpirySeconds / 60)).padStart(2, "0")}:${String(dealExpirySeconds % 60).padStart(2, "0")}`;
  const dealExpiryProgress = Math.max(0, (dealExpirySeconds / 900) * 100);
  const participants = [
    {
      slot: 1,
      name: "Ploy S.",
      detail: "Host",
      initials: "PL",
      isHost: true,
      isCurrent: false,
    },
    {
      slot: 2,
      name: "Narin K.",
      detail: "",
      initials: "NR",
      isHost: false,
      isCurrent: false,
    },
    {
      slot: 3,
      name: "Anya P.",
      detail: "",
      initials: "AP",
      isHost: false,
      isCurrent: false,
    },
    reserved
      ? {
          slot: 4,
          name: "You",
          detail: "",
          initials: "YO",
          isHost: false,
          isCurrent: true,
        }
      : {
          slot: 4,
          name: "Empty slot",
          detail: "Available",
          initials: "",
          isHost: false,
          isCurrent: false,
        },
  ];

  return (
    <div className="min-h-screen bg-white pb-8 sm:min-h-[844px]">
      <div className="relative">
        <DealVisual />
        <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-5">
          <button
            aria-label="Go home"
            className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur"
            onClick={() => setScreen("home")}
          >
            <Icon name="back" />
          </button>
          <span className="rounded-full bg-white/90 px-3 py-2 text-[10px] font-extrabold text-pink-700 shadow-sm backdrop-blur">
            {reserved ? "RESERVED" : "JOINING"}
          </span>
        </div>
      </div>

      <main className="-mt-5 relative z-10 rounded-t-[2rem] bg-white px-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pink-700">
              Food
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Katsu &amp; Co. group order
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Chicken katsu set + gyoza bundle
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-extrabold text-slate-950">฿756</p>
            <p className="text-[10px] font-bold text-slate-400">TOTAL PRICE</p>
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-200">
          <div className="flex items-center gap-3 p-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-300/15 text-amber-300">
              <Icon name="clock" size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Deal Expires In
              </p>
              <p className="mt-0.5 font-mono text-2xl font-extrabold tracking-wider text-amber-300">
                {dealExpiryCountdown}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold text-slate-300">
              Active
            </span>
          </div>
          <div className="h-1.5 bg-white/10">
            <div
              className="h-full rounded-r-full bg-amber-300 transition-all duration-1000"
              style={{ width: `${dealExpiryProgress}%` }}
            />
          </div>
        </section>

        <section className="mb-5 mt-4 flex items-center justify-between rounded-3xl bg-pink-50 p-5 ring-1 ring-pink-100">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-pink-500">
              Amount to Pay
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-pink-700">
              ฿189
            </p>
          </div>
          <div className="grid size-12 place-items-center rounded-full bg-pink-600 text-white shadow-md shadow-pink-200">
            <Icon name="wallet" size={22} />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-slate-950">
              Participants
            </p>
            <span className="text-xs font-bold text-slate-400">
              {reserved ? "4 of 4 slots" : "3 of 4 slots"}
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {participants.map((person) => (
              <div
                className="flex items-center gap-3 border-b border-slate-100 p-3.5 last:border-0"
                key={person.slot}
              >
                {person.initials ? (
                  <Avatar
                    label={person.initials}
                    size="size-10"
                    tone={person.isCurrent ? "bg-pink-200" : "bg-pink-100"}
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                    <Icon name="people" size={16} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-extrabold ${person.initials ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {person.name}
                  </p>
                  {person.detail && (
                    <p className="text-[10px] font-semibold text-slate-400">
                      {person.detail}
                    </p>
                  )}
                </div>
                {person.isHost && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">
                    Host
                  </span>
                )}
                {person.isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-mono text-[10px] font-extrabold text-orange-700">
                    <Icon name="clock" size={11} /> Pay in {countdown}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {reserved ? (
          <>
            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
              onClick={() => setScreen("postPayment")}
            >
              <Icon name="card" size={18} />
              Pay Now
            </button>
            <button
              className="w-full py-4 text-xs font-extrabold text-slate-500"
              onClick={() => setScreen("home")}
            >
              Leave Deal
            </button>
          </>
        ) : (
          <button
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
            onClick={() => {
              setSeconds(300);
              setShowCheckout(true);
            }}
          >
            <Icon name="people" size={18} />
            Join Deal
          </button>
        )}
      </main>

      {showCheckout && (
        <div
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-5 backdrop-blur-md"
          role="dialog"
        >
          <div className="w-full rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-pink-100 text-pink-600">
              <Icon name="wallet" size={25} />
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-pink-500">
              Amount to Pay
            </p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">
              ฿189
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Your exact share of the ฿756 total
            </p>

            <button
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
              onClick={() => setScreen("postPayment")}
            >
              <Icon name="card" size={18} />
              Pay Now
              <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs">
                {countdown}
              </span>
            </button>
            <button
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-700"
              onClick={() => setScreen("reservedDeal")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostPaymentDealScreen({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const participants = [
    { name: "Ploy S.", detail: "Deal creator", initials: "PL", status: "Host" },
    {
      name: "Narin K.",
      detail: "Payment complete",
      initials: "NR",
      status: "Paid",
    },
    {
      name: "Anya P.",
      detail: "Waiting for payment",
      initials: "AP",
      status: "Waiting",
    },
    { name: "You", detail: "Payment complete", initials: "YO", status: "Paid" },
  ];

  return (
    <div className="min-h-screen bg-white pb-8 sm:min-h-[844px]">
      <div className="relative">
        <DealVisual />
        <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between px-5">
          <button
            aria-label="Go home"
            className="grid size-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur"
            onClick={() => setScreen("home")}
          >
            <Icon name="back" />
          </button>
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-[10px] font-extrabold text-emerald-700 shadow-sm backdrop-blur">
            <Icon name="check" size={12} /> PAID
          </span>
        </div>
      </div>

      <main className="-mt-5 relative z-10 rounded-t-[2rem] bg-white px-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pink-700">
              Food
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Katsu &amp; Co. group order
            </p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Chicken katsu set + gyoza bundle
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-extrabold text-slate-950">฿756</p>
            <p className="text-[10px] font-bold text-slate-400">TOTAL PRICE</p>
          </div>
        </div>

        <div className="my-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <Icon name="check" size={19} />
          </span>
          <div>
            <p className="text-sm font-extrabold">
              Your ฿189 payment is complete
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">
              Your spot is secured. Wait for the host to place the order.
            </p>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-slate-950">
              Participants
            </p>
            <span className="text-xs font-bold text-slate-400">
              4 of 4 slots
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {participants.map((person) => (
              <div
                className="flex items-center gap-3 border-b border-slate-100 p-3.5 last:border-0"
                key={person.name}
              >
                <Avatar
                  label={person.initials}
                  size="size-10"
                  tone={person.name === "You" ? "bg-pink-200" : "bg-pink-100"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {person.detail}
                  </p>
                </div>
                {person.status === "Paid" && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                    <Icon name="check" size={11} /> Paid
                  </span>
                )}
                {person.status === "Waiting" && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                    Waiting
                  </span>
                )}
                {person.status === "Host" && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
          onClick={() => setShowConfirmModal(true)}
        >
          <Icon name="check" size={18} />
          Confirm Item Received
        </button>
        <button className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-700">
          Report Issue
        </button>
      </main>

      {showConfirmModal && (
        <div
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-5 backdrop-blur-md"
          role="dialog"
        >
          <div className="w-full rounded-[2rem] border border-pink-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-pink-100 text-pink-600 shadow-sm shadow-pink-100">
              <Icon name="bag" size={25} />
            </div>
            <p className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
              Confirm Item Received?
            </p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Are you sure you have received your exact order from the host?
              This action cannot be undone.
            </p>

            <button
              className="mt-6 w-full rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
              onClick={() => setScreen("completedDeal")}
            >
              Yes, Confirm
            </button>
            <button
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-700 transition active:bg-slate-50"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedDealScreen({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  const participants = [
    { name: "Ploy S.", detail: "Host", initials: "PL" },
    { name: "Narin K.", detail: "Participant", initials: "NR" },
    { name: "Anya P.", detail: "Participant", initials: "AP" },
    { name: "You", detail: "Participant", initials: "YO" },
  ];

  return (
    <div className="min-h-screen bg-white pb-8 sm:min-h-[844px]">
      <header className="relative flex h-20 items-center justify-between px-5">
        <button
          aria-label="Back to my deals"
          className="grid size-10 place-items-center rounded-full bg-pink-50 text-pink-700"
          onClick={() => setScreen("myDeals")}
        >
          <Icon name="back" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <BrandMark compact />
        </div>
        <span className="size-10" />
      </header>

      <main className="px-5">
        <section className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white p-3 shadow-sm">
          <DealVisual compact />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-pink-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-pink-700">
              Food
            </span>
            <p className="mt-2 truncate text-lg font-extrabold tracking-tight text-slate-950">
              Katsu &amp; Co. group order
            </p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
              Chicken katsu set + gyoza bundle
            </p>
            <p className="mt-2 text-sm font-extrabold text-slate-950">
              ฿756 total
            </p>
          </div>
        </section>

        <section className="mt-5 flex items-center gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-200">
            <Icon name="check" size={23} />
          </span>
          <div>
            <p className="text-base font-extrabold">Deal Completed</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Successfully shared and paid!
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-slate-950">
              Participants
            </p>
            <span className="text-xs font-bold text-slate-400">
              4 of 4 slots
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {participants.map((person) => (
              <div
                className="flex items-center gap-3 border-b border-slate-100 p-3.5 last:border-0"
                key={person.name}
              >
                <Avatar
                  label={person.initials}
                  size="size-10"
                  tone={person.name === "You" ? "bg-pink-200" : "bg-pink-100"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {person.detail}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                  <Icon name="check" size={11} /> Paid
                </span>
              </div>
            ))}
          </div>
        </section>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]">
          <Icon name="ticket" size={18} />
          View Receipt
        </button>
        <button
          className="w-full py-4 text-xs font-extrabold text-pink-700"
          onClick={() => setScreen("home")}
        >
          Back to Home
        </button>
      </main>
    </div>
  );
}

function RefundDealScreen({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  const participants = [
    { name: "Ploy S.", detail: "Host", initials: "PL", refundStatus: "" },
    {
      name: "Narin K.",
      detail: "Participant",
      initials: "NR",
      refundStatus: "Refunded",
    },
    {
      name: "Anya P.",
      detail: "Participant",
      initials: "AP",
      refundStatus: "Refunding",
    },
    {
      name: "You",
      detail: "Participant",
      initials: "YO",
      refundStatus: "Refunding",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-8 sm:min-h-[844px]">
      <header className="relative flex h-20 items-center justify-between px-5">
        <button
          aria-label="Back to deal history"
          className="grid size-10 place-items-center rounded-full bg-pink-50 text-pink-700"
          onClick={() => setScreen("myDealsHistory")}
        >
          <Icon name="back" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <BrandMark compact />
        </div>
        <span className="size-10" />
      </header>

      <main className="px-5">
        <section className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-orange-50 p-5 text-orange-900">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-200">
            <Icon name="warning" size={23} />
          </span>
          <div>
            <p className="text-sm font-extrabold leading-5">
              Deal Canceled - Refund in Progress
            </p>
            <p className="mt-1 text-[10px] font-semibold text-orange-700">
              Your payment is protected and being returned.
            </p>
          </div>
        </section>

        <section className="mt-5 flex items-center gap-4 rounded-3xl border border-pink-100 bg-white p-3 shadow-sm">
          <DealVisual compact />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-pink-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-pink-700">
              Food
            </span>
            <p className="mt-2 truncate text-lg font-extrabold tracking-tight text-slate-950">
              Sunday pizza bundle
            </p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
              Canceled by the host · 9 Jun
            </p>
            <p className="mt-2 text-sm font-extrabold text-slate-950">
              ฿880 total
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-pink-50 p-5 ring-1 ring-pink-100">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-pink-500">
            Refund Amount
          </p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-pink-700">
            ฿189
          </p>
          <div className="mt-4 flex items-start gap-2 border-t border-pink-100 pt-4 text-pink-800">
            <Icon name="clock" size={16} />
            <p className="text-[11px] font-semibold leading-5">
              Refunding to original payment method (within 3-5 days)
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-extrabold text-slate-950">
              Participants
            </p>
            <span className="text-xs font-bold text-slate-400">
              4 participants
            </span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {participants.map((person) => (
              <div
                className="flex items-center gap-3 border-b border-slate-100 p-3.5 last:border-0"
                key={person.name}
              >
                <Avatar
                  label={person.initials}
                  size="size-10"
                  tone={person.name === "You" ? "bg-pink-200" : "bg-pink-100"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {person.detail}
                  </p>
                </div>
                {person.refundStatus && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      person.refundStatus === "Refunded"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {person.refundStatus}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <button className="mt-6 w-full rounded-2xl border-2 border-pink-200 bg-white py-3.5 text-sm font-extrabold text-pink-700 transition active:bg-pink-50">
          Contact Support
        </button>
        <button
          className="w-full py-4 text-xs font-extrabold text-slate-500"
          onClick={() => setScreen("myDealsHistory")}
        >
          Back to History
        </button>
      </main>
    </div>
  );
}

function ProfileScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [foodAlerts, setFoodAlerts] = useState(true);
  const [drinkAlerts, setDrinkAlerts] = useState(true);

  return (
    <div className="pb-28">
      <TopBar
        title="Profile"
        action={
          <button
            className="rounded-full bg-pink-50 px-3 py-2 text-xs font-extrabold text-pink-700"
            onClick={() => setScreen("editProfile")}
          >
            Edit
          </button>
        }
      />
      <main className="px-5 pt-2">
        <section className="relative overflow-hidden rounded-[2rem] bg-pink-700 p-6 text-white shadow-xl shadow-pink-200">
          <div className="absolute -right-10 -top-12 size-40 rounded-full border-[24px] border-white/5" />
          <div className="absolute -bottom-16 left-10 size-32 rounded-full bg-fuchsia-400/10" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <Avatar label="MK" size="size-20" tone="bg-amber-200" />
              <span className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border-2 border-pink-700 bg-emerald-400 text-pink-950">
                <Icon name="check" size={12} />
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight">Mali K.</p>
              <p className="mt-1 text-xs font-semibold text-pink-200">
                +66 81 234 5678
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs font-extrabold text-amber-300">
                <Icon name="star" size={14} /> 4.9{" "}
                <span className="font-medium text-pink-200">
                  · Trusted member
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="my-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-pink-100 text-pink-700">
              <Icon name="bell" size={17} />
            </span>
            <p className="text-base font-extrabold text-slate-950">
              Notification Settings
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {[
              {
                label: "Food",
                description: "Notifications for nearby food deals",
                enabled: foodAlerts,
                toggle: () => setFoodAlerts((value) => !value),
              },
              {
                label: "Drink",
                description: "Notifications for nearby drink deals",
                enabled: drinkAlerts,
                toggle: () => setDrinkAlerts((value) => !value),
              },
            ].map((setting) => (
              <div
                className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-0"
                key={setting.label}
              >
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-slate-900">
                    {setting.label}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    {setting.description}
                  </p>
                </div>
                <button
                  aria-label={`Toggle ${setting.label}`}
                  aria-pressed={setting.enabled}
                  className={`relative h-7 w-12 rounded-full p-1 transition-colors ${
                    setting.enabled ? "bg-pink-700" : "bg-slate-200"
                  }`}
                  onClick={setting.toggle}
                >
                  <span
                    className={`block size-5 rounded-full bg-white shadow-sm transition-transform ${
                      setting.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-300">
          ÷ KAN VERSION 1.0
        </p>
        <button
          className="mb-2 mt-4 w-full rounded-2xl border border-red-200 bg-white py-4 text-sm font-extrabold text-red-600 transition active:scale-[0.98] active:bg-red-50"
          onClick={() => setScreen("login")}
        >
          Log Out
        </button>
      </main>
    </div>
  );
}

function EditProfileScreen({
  setScreen,
}: {
  setScreen: (screen: Screen) => void;
}) {
  const [fullName, setFullName] = useState("Mali K.");
  const [phone, setPhone] = useState("+66 81 234 5678");
  const [email, setEmail] = useState("mali@harnkan.com");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-white pb-8 sm:min-h-[844px]">
      <TopBar title="Edit Profile" onBack={() => setScreen("profile")} />

      <div className="flex-1 px-5 pt-4">
        <div className="mb-9 flex justify-center">
          <button
            aria-label="Change profile photo"
            className="relative rounded-full"
          >
            <Avatar label="MK" size="size-28" tone="bg-pink-200" />
            <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full border-4 border-white bg-pink-600 text-white shadow-md">
              <Icon name="camera" size={16} />
            </span>
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-extrabold text-slate-700">
              FULL NAME
            </span>
            <input
              autoComplete="name"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
              onChange={(event) => setFullName(event.target.value)}
              value={fullName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-extrabold text-slate-700">
              PHONE NUMBER
            </span>
            <input
              autoComplete="tel"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
              inputMode="tel"
              onChange={(event) => setPhone(event.target.value)}
              value={phone}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-extrabold text-slate-700">
              EMAIL ADDRESS
            </span>
            <input
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>
        </div>
      </div>

      <div className="px-5 pt-8">
        <button
          className="w-full rounded-2xl bg-pink-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-pink-200 transition active:scale-[0.98]"
          onClick={() => setScreen("profile")}
        >
          Save Changes
        </button>
        <button
          className="mt-3 w-full py-2 text-xs font-extrabold text-red-500"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div
          aria-modal="true"
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-5 backdrop-blur-md"
          role="dialog"
        >
          <div className="w-full rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-600">
              <Icon name="warning" size={26} />
            </div>
            <p className="mt-5 text-xl font-extrabold tracking-tight text-slate-950">
              Delete Account
            </p>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-extrabold text-slate-700"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-2xl bg-red-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-100"
                onClick={() => setScreen("login")}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  return (
    <div className="min-h-screen bg-pink-50 py-0 sm:py-8">
      <div className="relative mx-auto min-h-screen w-full overflow-hidden bg-white shadow-2xl sm:min-h-[844px] sm:max-w-[390px] sm:rounded-[2.5rem]">
        <div className="h-screen min-h-[720px] overflow-y-auto overscroll-contain sm:h-[844px]">
          {screen === "splash" && (
            <SplashScreen onContinue={() => setScreen("login")} />
          )}
          {screen === "login" && (
            <LoginScreen
              onLogin={() => setScreen("home")}
              onSignUp={() => setScreen("signup")}
            />
          )}
          {screen === "signup" && <SignUpScreen setScreen={setScreen} />}
          {screen === "home" && <HomeScreen setScreen={setScreen} />}
          {screen === "create" && <CreateScreen setScreen={setScreen} />}
          {screen === "myDeals" && <MyDealsScreen setScreen={setScreen} />}
          {screen === "myDealsHistory" && (
            <MyDealsScreen initialTab="history" setScreen={setScreen} />
          )}
          {screen === "deal" && <DealScreen setScreen={setScreen} />}
          {screen === "joinerDeal" && (
            <JoinerDealScreen setScreen={setScreen} />
          )}
          {screen === "reservedDeal" && (
            <JoinerDealScreen reserved setScreen={setScreen} />
          )}
          {screen === "postPayment" && (
            <PostPaymentDealScreen setScreen={setScreen} />
          )}
          {screen === "completedDeal" && (
            <CompletedDealScreen setScreen={setScreen} />
          )}
          {screen === "refundDeal" && (
            <RefundDealScreen setScreen={setScreen} />
          )}
          {screen === "profile" && <ProfileScreen setScreen={setScreen} />}
          {screen === "editProfile" && (
            <EditProfileScreen setScreen={setScreen} />
          )}
        </div>
        {screen !== "splash" &&
          screen !== "login" &&
          screen !== "signup" &&
          screen !== "editProfile" &&
          screen !== "joinerDeal" &&
          screen !== "reservedDeal" &&
          screen !== "postPayment" &&
          screen !== "completedDeal" &&
          screen !== "refundDeal" && (
            <BottomNav
              screen={screen === "myDealsHistory" ? "myDeals" : screen}
              setScreen={setScreen}
            />
          )}
      </div>
    </div>
  );
}
