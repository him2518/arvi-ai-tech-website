export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const { name, email, subject, message } = body;

    // Validate fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Grab the Resend API key from Cloudflare Environment Variables or use the provided key
    const resendApiKey = env.RESEND_API_KEY || "re_Zaq2LDtF_LsGGT4V7SJ5DY6surLVJHqDK";
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration: Missing API Key" }), { status: 500 });
    }

    // Set up the email payload
    const emailData = {
      // 'onboarding@resend.dev' is a free testing domain provided by Resend.
      // Once you verify your domain, you can change this to 'hello@arviaitech.com'
      from: "Arvi AI Tech <onboarding@resend.dev>", 
      to: env.CONTACT_EMAIL || "arviaitech@gmail.com",
      reply_to: email,
      subject: `New Lead: ${subject || "Website Inquiry"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <br/>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `
    };

    // Send the email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: "Failed to send email", details: errorText }), { status: 500 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
