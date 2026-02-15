import "./PageHeader.css";

type PageHeaderProps = {
	title: string;
	subtitle?: string;
};

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
	return (
		<section className="page-header">
			<div className="page-header-container">
				<h1 className="page-title">{title}</h1>

				{subtitle && <p>{subtitle}</p>}
			</div>
		</section>
	);
};
