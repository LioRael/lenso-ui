import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { css, html } from "react-strict-dom";
import {
  Backdrop,
  Glass,
  GlassButton,
  GlassGroup,
  LensoProvider,
  Slider,
  Switch,
  colors,
  glassCapabilities,
  Button,
} from "@lenso/ui-native";
import { ControlsExample } from "./ControlsExample";

const styles = css.create({
  root: { display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.background },
  headingGroup: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background,
  },
  background: { position: "absolute", inset: 0 },
  heading: { fontSize: 28, fontWeight: "700", color: colors.label },
  description: { fontSize: 15, color: colors.secondaryLabel, marginTop: 8 },
  content: { display: "flex", flexDirection: "column", padding: 8, paddingTop: 68, gap: 24 },
  glassRow: { display: "flex", flexDirection: "row", gap: 8 },
  glass: {
    display: "flex",
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: colors.label, fontSize: 17, fontWeight: "600" },
  card: {
    display: "flex",
    flexDirection: "column",
    padding: 20,
    gap: 20,
    borderRadius: 26,
    backgroundColor: colors.secondaryBackground,
  },
});

export default function App() {
  const [catalog, setCatalog] = useState(false);
  return catalog ? (
    <ControlsExample onBack={() => setCatalog(false)} />
  ) : (
    <GlassExample onCatalog={() => setCatalog(true)} />
  );
}

function GlassExample({ onCatalog }: { onCatalog: () => void }) {
  const [dark, setDark] = useState(false);
  const [checked, setChecked] = useState(true);
  const [level, setLevel] = useState(42);
  const [actions, setActions] = useState(0);
  const [locked, setLocked] = useState(false);
  const [opaque, setOpaque] = useState(false);
  return (
    <LensoProvider appearance={dark ? "dark" : "light"} reduceTransparency={opaque}>
      <html.div style={styles.root}>
        <Backdrop sourceID="page" xstyle={styles.background}>
          <ScrollView
            testID="backdrop-scroll"
            contentContainerStyle={{ paddingTop: 96, paddingBottom: 120 }}
          >
            {Array.from({ length: 24 }, (_, index) => (
              <View
                key={index}
                style={{
                  height: 96,
                  flexDirection: "row",
                  backgroundColor: ["#7faeb5", "#e4b58f", "#8b9dc2", "#b3c6a3"][index % 4],
                }}
              >
                <Text style={{ margin: 16, color: "#233444", fontSize: 32 }}>
                  Background {index + 1}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Backdrop>
        <ScrollView
          style={{ flex: 1, marginHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <html.div style={styles.content}>
            <html.div style={styles.headingGroup}>
              <html.h1 style={styles.heading}>Lenso Native</html.h1>
              <html.p style={styles.description}>
                {Platform.OS === "ios"
                  ? "Apple system controls and Glass"
                  : "Lenso controls and native Glass rendering"}
              </html.p>
              <Button onPress={onCatalog}>Open native catalog</Button>
            </html.div>
            <GlassGroup sourceID="page" spacing={20} xstyle={styles.glassRow}>
              <Glass sourceID="page" xstyle={styles.glass} testID="glass-first">
                <html.span style={styles.label}>Glass</html.span>
              </Glass>
              <Glass sourceID="page" xstyle={styles.glass} testID="glass-second">
                <html.span style={styles.label}>Together</html.span>
              </Glass>
            </GlassGroup>
            <html.div style={styles.card}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <html.span style={styles.label}>Notifications</html.span>
                <Switch
                  testID="notifications-switch"
                  accessibilityLabel="Notifications"
                  checked={checked}
                  onCheckedChange={(next) => {
                    if (!locked) setChecked(next);
                  }}
                />
              </View>
              <html.span style={styles.label}>Level {level}</html.span>
              <Slider
                testID="level-slider"
                accessibilityLabel="Level"
                value={level}
                onValueChange={(next) => {
                  if (!locked) setLevel(next);
                }}
              />
              <html.span style={styles.description}>Actions {actions}</html.span>
            </html.div>
            <GlassButton
              sourceID="page"
              testID="primary-action"
              variant="prominent"
              onPress={() => setActions((count) => count + 1)}
            >
              Continue
            </GlassButton>
            <View style={{ gap: 8 }}>
              {[
                {
                  label: dark ? "Use light appearance" : "Use dark appearance",
                  onPress: () => setDark(!dark),
                },
                {
                  label: locked ? "Allow value changes" : "Hold controlled values",
                  onPress: () => setLocked(!locked),
                },
                {
                  label: opaque ? "Restore transparency" : "Reduce transparency",
                  onPress: () => setOpaque(!opaque),
                },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  onPress={action.onPress}
                  style={{
                    minHeight: 40,
                    padding: 8,
                    backgroundColor: dark ? "#242426" : "#f2f2f7",
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: dark ? "white" : "black", fontSize: 15 }}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <html.p style={styles.description}>
              System glass: {String(glassCapabilities.systemGlass)} · Refraction:{" "}
              {String(glassCapabilities.refractiveGlass)}
            </html.p>
          </html.div>
        </ScrollView>
      </html.div>
    </LensoProvider>
  );
}
