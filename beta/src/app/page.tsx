import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>That Josh Guy</h1>
      <p>Welcome to my new Next.js powered site.</p>
      <img
        src="https://via.placeholder.com/200"
        alt="Profile placeholder"
        width={200}
        height={200}
      />
      <ThemeToggle />
    </main>
  );
}
