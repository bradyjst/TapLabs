import { Link } from "react-router-dom";
import "./Pages.css";

export default function Privacy() {
	return (
		<div className="page-shell">
			<Link to="/" className="back-link">
				← Back to TapLabs
			</Link>

			<h1>Privacy Policy</h1>
			<p className="page-subtitle">Last updated: March 2026</p>

			<h2>1. Information We Collect</h2>
			<p>
				When you create an account, we collect the email address and basic
				profile information provided through your authentication method (Google
				sign-in or email/password). When you use TapLabs, we collect drill
				session performance data including accuracy, unstable rate, hit counts,
				and timing offsets. This data is tied to your account so you can track
				your progress over time. We do not collect any information beyond what
				is necessary to provide the service.
			</p>

			<h2>2. How We Use Your Information</h2>
			<p>
				Your data is used to provide the TapLabs service — generating your
				stats, powering the leaderboard, enabling coaching features, and
				displaying your profile. We may use aggregated, anonymized data to
				improve the product. We do not sell, rent, or share your personal
				information with third parties for marketing purposes.
			</p>

			<h2>3. Third-Party Services</h2>
			<p>
				TapLabs relies on the following third-party services to operate:
				Supabase for authentication and database storage, Google OAuth for
				sign-in functionality, and Stripe for processing membership payments.
				Each of these services has its own privacy policy governing how they
				handle your data. We only share the minimum information necessary for
				each service to function.
			</p>

			<h2>4. Data Storage &amp; Security</h2>
			<p>
				Your data is stored in a PostgreSQL database managed by Supabase, with
				row-level security policies ensuring users can only access their own
				data. Authentication tokens are handled securely through Supabase Auth.
				While we take reasonable measures to protect your information, no method
				of electronic storage is 100% secure, and we cannot guarantee absolute
				security.
			</p>

			<h2>5. Data Retention</h2>
			<p>
				Your account data and session history are retained for as long as your
				account is active. If you wish to have your account and associated data
				deleted, contact us at the email below and we will process your request
				within a reasonable timeframe.
			</p>

			<h2>6. Your Rights</h2>
			<p>
				You have the right to access the personal data we hold about you,
				request correction of inaccurate data, request deletion of your account
				and all associated data, and withdraw consent for data processing at any
				time by discontinuing use of the service. To exercise any of these
				rights, contact us using the information below.
			</p>

			<h2>7. Cookies &amp; Tracking</h2>
			<p>
				TapLabs uses essential cookies for authentication session management.
				These are required for the service to function and cannot be disabled.
				We do not use advertising cookies or third-party tracking cookies. No
				data is shared with advertisers.
			</p>

			<h2>8. Children's Privacy</h2>
			<p>
				TapLabs is not intended for children under the age of 13. We do not
				knowingly collect personal information from children under 13. If you
				believe a child under 13 has provided us with personal information,
				please contact us and we will take steps to delete that information.
			</p>

			<h2>9. Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. Any changes will be
				posted on this page with an updated revision date. Continued use of
				TapLabs after changes are posted constitutes acceptance of the updated
				policy.
			</p>

			<h2>10. Contact</h2>
			<p>
				If you have questions about this policy or want to request data
				deletion, please reach out at{" "}
				<a href="mailto:contact@taplabs.app">contact@taplabs.app</a>.
			</p>
		</div>
	);
}