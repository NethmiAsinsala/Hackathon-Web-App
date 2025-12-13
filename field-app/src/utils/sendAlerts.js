// src/utils/sendAlerts.js
export const sendToDiscord = async (report) => {
  // REPLACE WITH YOUR WEBHOOK URL
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1449391992504062153/B8_DEv5GcTi-WuS76mgtv8GeD2iuDeRv1y4dFgLmla8UGIvUcFnnGWvfHgRa4FY9wLAC";

  // Normalize severity to lowercase
  const severity = report.severity?.toLowerCase();

  // Filter: Only alert for "high" or "critical" severity
  if (severity !== "high" && severity !== "critical") {
    return;
  }

  // Construct Discord Embed payload
  const payload = {
    username: "Aegis Field Alert",
    embeds: [{
      title: `Type: ${report.type}`,
      color: 15548997, // Red
      fields: [
        { name: "Severity", value: report.severity, inline: true },
        { name: "Location", value: `${report.latitude}, ${report.longitude}`, inline: true },
        { name: "Description", value: report.description || "No description provided", inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("🔔 Alert Sent to Discord");
  } catch (error) {
    // Don't crash the app if Discord is down
    console.error("Discord Alert Failed:", error);
  }
};