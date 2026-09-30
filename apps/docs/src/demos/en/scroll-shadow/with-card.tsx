"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Button, Card, ScrollShadow } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  card: { maxWidth: 400 },
  content: { padding: 0 },
  scroll: { height: 300, paddingInline: 16 },
  paragraphs: { display: "flex", flexDirection: "column", gap: 16 },
  footer: { marginTop: 16, display: "flex", flexDirection: "row", gap: 8 },
  button: { width: "100%" },
});
export default function WithCard() {
  return (
    <Card xstyle={styles.card}>
      <Card.Header>
        <Card.Title>Terms and Conditions</Card.Title>
        <Card.Description>Please review before proceeding</Card.Description>
      </Card.Header>
      <Card.Content xstyle={styles.content}>
        <ScrollShadow
          tabIndex={0}
          aria-label="Terms and Conditions"
          xstyle={styles.scroll}
          size={80}
        >
          <div {...stylex.props(styles.paragraphs)}>
            {Array.from({ length: 10 }, (_, index) => (
              <p key={index}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                quam. Morbi accumsan cursus enim, sed ultricies sapien.
              </p>
            ))}
          </div>
        </ScrollShadow>
      </Card.Content>
      <Card.Footer xstyle={styles.footer}>
        <Button xstyle={styles.button} variant="secondary">
          Cancel
        </Button>
        <Button xstyle={styles.button}>Accept</Button>
      </Card.Footer>
    </Card>
  );
}
