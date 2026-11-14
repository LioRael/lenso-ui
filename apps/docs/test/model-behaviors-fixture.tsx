import { useState } from "react";
import { createRoot } from "react-dom/client";
import { parseDate, Time } from "@internationalized/date";
import {
  DateField,
  DatePicker,
  TimeField,
  ColorField,
  Calendar,
  RangeCalendar,
  ColorPicker,
  ColorSlider,
  ColorArea,
} from "@lenso/ui";
import { createAgent } from "@lenso/ui/agent";
function Fixture() {
  const [bookingDisabled, setBookingDisabled] = useState(false);
  return (
    <main style={{ padding: 20, display: "grid", gap: 16 }}>
      <form id="models">
        <DateField
          name="departure"
          defaultValue={parseDate("2026-11-13")}
          onValueChange={(value, details) => {
            document.body.dataset["dateValueSource"] = details.source;
            if (value?.day === 15) details.cancel();
          }}
        >
          <DateField.Label>Departure</DateField.Label>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Description>Choose a departure date</DateField.Description>
        </DateField>
        <TimeField aria-label="Meeting time" name="meeting" defaultValue={new Time(9, 30)}>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField>
        <ColorField
          name="accent"
          defaultValue="#FF0000"
          onValueChange={(value, details) => {
            if (value?.toString("hex").toUpperCase() === "#0000FF") details.cancel();
          }}
        >
          <ColorField.Label>Accent</ColorField.Label>
          <ColorField.Input />
        </ColorField>
        <button type="reset">Reset models</button>
      </form>
      <DatePicker
        modal
        onOpenChangeComplete={(open) => {
          document.body.dataset["datePopupComplete"] = String(open);
        }}
        onOpenChange={(open, details) => {
          document.body.dataset["datePopupChange"] = `${open}:${details.source}`;
        }}
        aria-label="Return date"
        name="return"
        defaultValue={parseDate("2026-11-13")}
        onValueChange={(value, details) => {
          document.body.dataset["dateValueSource"] = details.source;
          if (value?.day === 15) details.cancel();
        }}
      >
        <DatePicker.Input>{(segment) => <DatePicker.Segment segment={segment} />}</DatePicker.Input>
        <DatePicker.Trigger>Choose return date</DatePicker.Trigger>
        <DatePicker.Popover aria-label="Return date calendar">
          <DatePicker.Title>Return date calendar</DatePicker.Title>
          <Calendar aria-label="Return calendar">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>Choose return year</Calendar.YearPickerTrigger>
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody />
            </Calendar.YearPickerGrid>
          </Calendar>
          <DatePicker.Close>Cancel date</DatePicker.Close>
        </DatePicker.Popover>
      </DatePicker>
      <button onClick={() => setBookingDisabled(true)}>Disable booking</button>
      <Calendar
        isDisabled={bookingDisabled}
        onYearPickerOpenChange={(open, details) => {
          document.body.dataset["yearChange"] = `${open}:${details.source}`;
        }}
        aria-label="Booking"
        defaultValue={parseDate("2026-11-30")}
      >
        <Calendar.Header>
          <Calendar.YearPickerTrigger>Choose year</Calendar.YearPickerTrigger>
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <Calendar.YearPickerGrid
          onValueChange={(year, details) => {
            document.body.dataset["yearValueSource"] = details.source;
            if (year === 2027) details.cancel();
          }}
        >
          <Calendar.YearPickerGridBody />
        </Calendar.YearPickerGrid>
      </Calendar>
      <RangeCalendar
        aria-label="Trip"
        defaultValue={{ start: parseDate("2026-11-10"), end: parseDate("2026-11-12") }}
        onValueChange={(value, details) => {
          if (value?.end.day === 16) details.cancel();
        }}
      >
        <RangeCalendar.Grid>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <ColorPicker
        aria-label="Palette"
        space="hsl"
        defaultValue="hsl(120 100% 50%)"
        onValueChange={(_value, details) => {
          if (details.color.coords[0] === 240) details.cancel();
        }}
      >
        <ColorPicker.Trigger>Open palette</ColorPicker.Trigger>
        <ColorPicker.Popover aria-label="Palette editor">
          <ColorPicker.Title>Palette editor</ColorPicker.Title>
          <ColorArea>
            <ColorArea.Thumb />
          </ColorArea>
          <ColorSlider channel="hue">
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
          <ColorPicker.Close>Close palette</ColorPicker.Close>
        </ColorPicker.Popover>
      </ColorPicker>
    </main>
  );
}
createRoot(document.getElementById("fixture")!).render(<Fixture />);
Object.assign(window, { modelAgent: createAgent() });
declare global {
  interface Window {
    modelAgent: ReturnType<typeof createAgent>;
  }
}
