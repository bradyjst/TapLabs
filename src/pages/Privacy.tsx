import { Link } from "react-router-dom";
import "./Pages.css";

export default function Privacy() {
	return (
		<div className="page-shell">
			<Link to="/" className="back-link">
				← Back to TapLabs
			</Link>

			<h1>Privacy Policy</h1>
			<p className="page-subtitle">Last updated: February 2026</p>

			<h2>1. Information We Collect</h2>
			<p>
				{/* TODO: Detail what you collect — email, auth provider data,
				    session/drill performance data, analytics (GA) */}
				Details on collected information will be provided here.
			</p>

			<h2>2. How We Use Your Information</h2>
			<p>
				{/* TODO: Detail usage — providing the service, generating stats,
				    improving the product, processing payments via Stripe */}
				Details on data usage will be provided here.
			</p>

			<h2>3. Third-Party Services</h2>
			<p>
				{/* TODO: List third parties — Supabase (auth & database), 
				    Stripe (payments), Google Analytics, Google OAuth */}
				Details on third-party services will be provided here.
			</p>

			<h2>4. Data Storage &amp; Security</h2>
			<p>
				{/* TODO: Detail where data is stored (Supabase/PostgreSQL),
				    security measures, encryption */}
				Details on data storage and security will be provided here.
			</p>

			<h2>5. Data Retention</h2>
			<p>
				{/* TODO: Detail how long data is kept, what happens on 
				    account deletion */}
				Details on data retention will be provided here.
			</p>

			<h2>6. Your Rights</h2>
			<p>
				{/* TODO: Detail user rights — access, deletion, export,
				    opt-out of analytics */}
				Details on user rights regarding their data will be provided here.
			</p>

			<h2>7. Cookies &amp; Tracking</h2>
			<p>
				{/* TODO: Detail cookie usage — auth session cookies, 
				    Google Analytics cookies */}
				Details on cookies and tracking will be provided here.
			</p>

			<h2>8. Children's Privacy</h2>
			<p>
				{/* TODO: COPPA compliance — minimum age requirement,
				    no intentional collection from children */}
				Details on children's privacy protections will be provided here.
			</p>

			<h2>9. Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. Any changes will be
				posted on this page with an updated revision date.
			</p>

			<h2>10. Contact</h2>
			<p>
				{/* TODO: Add contact email */}
				If you have questions about this policy, please contact us.
			</p>
		</div>
	);
}
