export default function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside>
      <strong>Note</strong>
      <p>{children}</p>
    </aside>
  );
}
