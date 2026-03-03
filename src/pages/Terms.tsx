import { Link } from "react-router-dom";
import "./Pages.css";

export default function Terms() {
	return (
		<div className="page-shell">
			<Link to="/" className="back-link">
				← Back to TapLabs
			</Link>

			<h1>Terms of Service</h1>
			<p className="page-subtitle">Last updated: March 2026</p>

			<h2>1. Acceptance of Terms</h2>
			<p>
				By accessing and using TapLabs, you agree to be bound by these Terms of
				Service. If you do not agree to these terms, please do not use the
				service.
			</p>

			<h2>2. Description of Service</h2>
			<p>
				TapLabs provides rhythm training tools, performance analytics, and
				related features for osu! players. The service is currently in beta,
				and features may change, be added, or be removed at any time without
				notice.
			</p>

			<h2>3. Accounts</h2>
			<p>
				You are responsible for maintaining the security of your account
				credentials. You must provide accurate information when creating an
				account. You may not share your account with others or create multiple
				accounts. We reserve the right to suspend or terminate accounts that
				violate these terms. You must be at least 13 years old to create an
				account.
			</p>

			<h2>4. Membership &amp; Payments</h2>
			<p>
				TapLabs offers optional paid memberships that unlock additional features.
				Payments are processed securely through Stripe. Memberships are billed
				on a recurring basis unless cancelled. You may cancel your membership at
				any time, and access to paid features will continue until the end of
				your current billing period. Refunds are handled on a case-by-case
				basis — contact us if you have billing concerns. We reserve the right to
				change membership pricing with reasonable notice.
			</p>

			<h2>5. Acceptable Use</h2>
			<p>
				You agree not to use TapLabs to submit fraudulent or manipulated session
				data, attempt to exploit, reverse engineer, or interfere with the
				service, harass other users or abuse community features such as the
				feedback system, use automated tools or scripts to interact with the
				service, or resell or redistribute access to paid features. Violation of
				these terms may result in account suspension or termination.
			</p>

			<h2>6. Data &amp; Privacy</h2>
			<p>
				Your use of TapLabs is also governed by our{" "}
				<Link to="/privacy">Privacy Policy</Link>, which describes how we
				collect, use, and protect your data.
			</p>

			<h2>7. Intellectual Property</h2>
			<p>
				All content, code, design, and branding associated with TapLabs is the
				property of TapLabs and its creator. You may not copy, modify, or
				distribute any part of the service without permission. User-generated
				content such as suggestions and feedback may be used by TapLabs to
				improve the product.
			</p>

			<h2>8. Disclaimer</h2>
			<p>
				TapLabs is provided "as is" without warranties of any kind, express or
				implied. We do not guarantee that the service will be uninterrupted,
				error-free, or that data will be preserved indefinitely. As the service
				is currently in beta, session data and scores may be affected by updates
				or changes to the platform. Use the service at your own discretion.
			</p>

			<h2>9. Limitation of Liability</h2>
			<p>
				To the fullest extent permitted by law, TapLabs and its creator shall
				not be liable for any indirect, incidental, or consequential damages
				arising from your use of the service, including but not limited to loss
				of data or interruption of service.
			</p>

			<h2>10. Changes to Terms</h2>
			<p>
				We reserve the right to modify these terms at any time. Changes will be
				posted on this page with an updated revision date. Continued use of
				TapLabs after changes are posted constitutes acceptance of the updated
				terms.
			</p>

			<h2>11. Contact</h2>
			<p>
				If you have questions about these terms, please reach out at{" "}
				<a href="mailto:contact@taplabs.app">contact@taplabs.app</a>.
			</p>
		</div>
	);
}