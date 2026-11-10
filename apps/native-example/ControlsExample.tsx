import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { css } from "react-strict-dom";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  CheckboxGroup,
  Code,
  Description,
  EmptyState,
  Fieldset,
  Heading,
  Input,
  LensoProvider,
  Paragraph,
  Radio,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Separator,
  Skeleton,
  Spinner,
  Stepper,
  Surface,
  Textarea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@lenso/ui-native";

const styles = css.create({
  content: { padding: 24, gap: 20 },
  accent: { color: "#b34b00" },
  inputFocus: { borderWidth: 1, borderColor: { default: "transparent", ":focus": "#0088ff" } },
});

function CatalogScroll({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 64 }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ControlsExample({ onBack }: { onBack: () => void }) {
  const [dark, setDark] = useState(false);
  const [locked, setLocked] = useState(false);
  const [groupsDisabled, setGroupsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState(0);
  const [name, setName] = useState("Ada");
  const nameRef = useRef<ComponentRef<typeof Input>>(null);
  const [validation, setValidation] = useState("");
  const [notes, setNotes] = useState("Bring notes");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [delivery, setDelivery] = useState(["email"]);
  const [plan, setPlan] = useState<string | null>("personal");
  const [formats, setFormats] = useState(["bold"]);
  const [audience, setAudience] = useState<string | null>("personal");
  const [guests, setGuests] = useState(2);
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <LensoProvider appearance={dark ? "dark" : "light"}>
        <Surface style={{ flex: 1 }}>
          <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
          <SafeAreaView style={{ flex: 1 }}>
            <CatalogScroll>
              <Surface xstyle={styles.content}>
                <ButtonGroup>
                  <Button onPress={onBack}>Back to Glass</Button>
                  <Button onPress={() => setDark(!dark)}>
                    {dark ? "Use light appearance" : "Use dark appearance"}
                  </Button>
                  <Button onPress={() => setLocked(!locked)}>
                    {locked ? "Allow values" : "Hold values"}
                  </Button>
                </ButtonGroup>
                <Heading level={1}>Native controls</Heading>
                <Paragraph>Form fields, choices and actions with platform-owned input.</Paragraph>
                <Description>Owner values: {locked ? "held" : "accepting"}</Description>

                <Card testID="actions-card">
                  <Card.Title>Actions</Card.Title>
                  <ButtonGroup>
                    <Button variant="prominent" onPress={() => setActions((v) => v + 1)}>
                      Save settings
                    </Button>
                    <Button disabled onPress={() => setActions((v) => v + 1)}>
                      Disabled action
                    </Button>
                    <Button isLoading={loading} onPress={() => setActions((v) => v + 1)}>
                      Loading action
                    </Button>
                  </ButtonGroup>
                  <Button variant="borderless" onPress={() => setLoading(!loading)}>
                    {loading ? "Stop loading" : "Start loading"}
                  </Button>
                  <Code>Actions {actions}</Code>
                </Card>

                <Card testID="fields-card">
                  <Card.Title>Profile</Card.Title>
                  <Button variant="borderless" onPress={() => nameRef.current?.focus()}>
                    Focus name
                  </Button>
                  <TextField
                    ref={nameRef}
                    xstyle={styles.inputFocus}
                    label="Name"
                    value={name}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={(next) => {
                      if (!locked) setName(next);
                    }}
                    description="Your display name"
                  />
                  <Textarea
                    accessibilityLabel="Notes"
                    value={notes}
                    onChangeText={(next) => {
                      if (!locked) setNotes(next);
                    }}
                  />
                  <SearchField
                    accessibilityLabel="Search notes"
                    placeholder="Search notes"
                    value={query}
                    onChangeText={(next) => {
                      if (!locked) setQuery(next);
                    }}
                    onSubmitEditing={(event) => {
                      setSubmitted(event.nativeEvent.text);
                      Keyboard.dismiss();
                    }}
                  />
                  <TextField label="Read only" value="Reference" readOnly />
                  <TextField label="Disabled field" value="Unavailable" disabled />
                  <TextField
                    label="Validation example"
                    value={validation}
                    onChangeText={(next) => {
                      if (!locked) setValidation(next);
                    }}
                    placeholder="Required"
                    errorMessage={validation.trim() ? undefined : "Enter a value"}
                  />
                  <Description>Name value: {name}</Description>
                  <Description>Notes value: {notes}</Description>
                  <Description>Search submitted: {submitted || "none"}</Description>
                </Card>

                <Card testID="choices-card">
                  <Card.Title>Choices</Card.Title>
                  <Button onPress={() => setGroupsDisabled(!groupsDisabled)}>
                    {groupsDisabled ? "Enable groups" : "Disable groups"}
                  </Button>
                  <Fieldset legend="Delivery">
                    <CheckboxGroup
                      value={delivery}
                      disabled={groupsDisabled}
                      onValueChange={(next) => {
                        if (!locked) setDelivery(next);
                      }}
                    >
                      <Checkbox value="email" disabled={false}>
                        Email updates
                      </Checkbox>
                      <Checkbox value="push">Push updates</Checkbox>
                    </CheckboxGroup>
                    <Description>Delivery {delivery.join(",") || "none"}</Description>
                  </Fieldset>
                  <Separator />
                  <Fieldset legend="Plan">
                    <RadioGroup
                      value={plan}
                      disabled={groupsDisabled}
                      onValueChange={(next) => {
                        if (!locked) setPlan(next);
                      }}
                    >
                      <Radio value="personal">Personal plan</Radio>
                      <Radio value="business">Business plan</Radio>
                    </RadioGroup>
                    <Description>Plan {plan}</Description>
                  </Fieldset>
                  <ToggleButtonGroup
                    value={formats}
                    disabled={groupsDisabled}
                    onValueChange={(next) => {
                      if (!locked) setFormats(next);
                    }}
                  >
                    <ToggleButton value="bold">Bold</ToggleButton>
                    <ToggleButton value="italic">Italic</ToggleButton>
                  </ToggleButtonGroup>
                  <Description>Format {formats.join(",") || "none"}</Description>
                </Card>

                <Card testID="system-controls-card">
                  <Card.Title>System controls</Card.Title>
                  <SegmentedControl
                    accessibilityLabel="Audience"
                    value={audience}
                    items={[
                      { value: "personal", label: "Personal" },
                      { value: "business", label: "Business" },
                      { value: "unavailable", label: "Unavailable", disabled: true },
                    ]}
                    onValueChange={(next) => {
                      if (!locked) setAudience(next);
                    }}
                  />
                  <Description>Audience {audience}</Description>
                  <Stepper
                    accessibilityLabel="Guests"
                    value={guests}
                    min={1}
                    max={3}
                    incrementLabel="Increase guests"
                    decrementLabel="Decrease guests"
                    onValueChange={(next) => {
                      if (!locked) setGuests(next);
                    }}
                  />
                  <Description>Guests {guests}</Description>
                </Card>

                <Card>
                  <Card.Title>Content and feedback</Card.Title>
                  <Paragraph xstyle={styles.accent}>Caller StyleX color</Paragraph>
                  <Badge>3 unread</Badge>
                  <Alert>
                    <Alert.Title>Saved locally</Alert.Title>
                    <Alert.Description>This example keeps its state in memory.</Alert.Description>
                  </Alert>
                  <EmptyState>
                    <EmptyState.Title>No attachments</EmptyState.Title>
                    <EmptyState.Description>
                      Add an attachment in your application.
                    </EmptyState.Description>
                  </EmptyState>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Spinner />
                    <Skeleton style={{ width: 160 }} />
                  </View>
                </Card>
              </Surface>
            </CatalogScroll>
          </SafeAreaView>
        </Surface>
      </LensoProvider>
    </SafeAreaProvider>
  );
}
