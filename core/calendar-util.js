export function generateICSFile(eventDetails) {
  const {
    title,
    description = "",
    location = "Online",
    startDate,
    endDate,
  } = eventDetails;

  // Validate and format dates
  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      throw new Error("Invalid date provided");
    }
    return (
      new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    );
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  // Construct the .ics content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GrokAPI//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${new Date().getTime()}@grokapi.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formattedStartDate}`,
    `DTEND:${formattedEndDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Generate a shorter and cleaner file name
  const safeTitle = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  const fileName = `${safeTitle}_Event.ics`;

  // Create and trigger the download
  const blob = new Blob([icsContent], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
