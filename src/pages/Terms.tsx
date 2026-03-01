import { Link } from "react-router-dom";
import "./Pages.css";

export default function Terms() {
	return (
		<div className="page-shell">
			<Link to="/" className="back-link">
				← Back to TapLabs
			</Link>

			<h1>Terms of Service</h1>
			<p className="page-subtitle">Last updated: February 2026</p>

			<h2>1. Acceptance of Terms</h2>
			<p>
				By accessing and using TapLabs, you agree to be bound by these Terms of
				Service. If you do not agree to these terms, please do not use the
				service.
			</p>

			<h2>2. Description of Service</h2>
			<p>
				TapLabs provides rhythm training tools and related analytics. The
				service is currently in beta, and features may change, be added, or be
				removed at any time without notice.
			</p>

			<h2>3. Accounts</h2>
			<p>
				{/* TODO: Fill in account terms — responsibility for credentials, 
				    age requirements, account termination conditions */}
				Terms regarding user accounts will be detailed here.
			</p>

			<h2>4. Membership &amp; Payments</h2>
			<p>
				{/* TODO: Fill in payment terms — billing cycle, refund policy,
				    cancellation, price changes */}
				Terms regarding paid memberships and billing will be detailed here.
			</p>

			<h2>5. Acceptable Use</h2>
			<p>
				{/* TODO: Fill in acceptable use — no cheating, no abuse, 
				    no reverse engineering, no scraping */}
				Terms regarding acceptable use of the platform will be detailed here.
			</p>

			<h2>6. Data &amp; Privacy</h2>
			<p>
				Your use of TapLabs is also governed by our{" "}
				<Link to="/privacy">Privacy Policy</Link>, which describes how we
				collect, use, and protect your data.
			</p>

			<h2>7. Disclaimer</h2>
			<p>
				{/* TODO: Fill in disclaimer — service provided "as is", no warranties,
				    beta status, data loss possibility */}
				Disclaimer terms will be detailed here.
			</p>

			<h2>8. Changes to Terms</h2>
			<p>
				We reserve the right to modify these terms at any time. Continued use of
				TapLabs after changes constitutes acceptance of the updated terms.
			</p>

			<h2>9. Contact</h2>
			<p>
				{/* TODO: Add contact email */}
				If you have questions about these terms, please contact us.
			</p>
		</div>
	);
}
