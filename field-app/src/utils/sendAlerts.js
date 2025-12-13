// src/utils/sendAlerts.js
export const sendToDiscord = async (report) => {
  // REPLACE WITH YOUR WEBHOOK URL
  const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

  // Normalize severity to lowercase
  const severity = report.severity?.toLowerCase();

  // Filter: Only alert for "high" or "critical" severity (SOS always goes through)
  if (severity !== "high" && severity !== "critical" && !report.isSOS) {
    return;
  }

  // Build fields array
  const fields = [
    { name: "🚨 Type", value: report.type, inline: true },
    { name: "⚠️ Severity", value: report.severity, inline: true },
    { name: "📍 Location", value: `[View on Map](https://www.google.com/maps?q=${report.latitude},${report.longitude})`, inline: true },
  ];

  // Add people affected if provided
  if (report.peopleAffected && report.peopleAffected > 0) {
    fields.push({ name: "👥 People Affected", value: report.peopleAffected.toString(), inline: true });
  }

  // Add resources needed if provided
  if (report.resourcesNeeded && report.resourcesNeeded.length > 0) {
    const resourceLabels = {
      medical: '🏥 Medical',
      food: '🍞 Food & Water',
      shelter: '🏠 Shelter',
      rescue: '🚒 Rescue Team',
      evacuation: '🚗 Evacuation',
      equipment: '🔧 Equipment'
    };
    const resourcesList = report.resourcesNeeded
      .map(r => resourceLabels[r] || r)
      .join(', ');
    fields.push({ name: "🚑 Resources Needed", value: resourcesList, inline: false });
  }

  // Add description
  fields.push({ 
    name: "📝 Description", 
    value: report.description || "No description provided", 
    inline: false 
  });

  // Indicate if photo is attached (viewable in dashboard)
  if (report.photoData) {
    fields.push({
      name: "📸 Photo",
      value: "Photo attached - view in dashboard",
      inline: true
    });
  }

  // Determine embed color based on type
  let color = 15548997; // Red default
  if (report.isSOS) {
    color = 16711680; // Bright red for SOS
  } else if (severity === "critical") {
    color = 10038562; // Purple
  } else if (severity === "high") {
    color = 15548997; // Red
  }

  // Construct Discord Embed payload
  const payload = {
    username: report.isSOS ? "🆘 AEGIS SOS ALERT" : "Aegis Field Alert",
    embeds: [{
      title: report.isSOS ? "🆘 EMERGENCY SOS - IMMEDIATE RESPONSE REQUIRED" : `🚨 New ${report.severity} Incident`,
      color: color,
      fields: fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: "Aegis Emergency Response System"
      }
    }]
  };

  // Note: Discord embeds don't support base64 images directly
  // Photos are stored in Firestore and viewable in the dashboard

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