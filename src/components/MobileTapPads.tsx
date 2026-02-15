import "./MobileTapPads.css";

type Props = {
	onTap: () => void;
};

export default function MobileTapPads({ onTap }: Props) {
	return (
		<div className="tap-pads">
			<button className="tap-button left" onTouchStart={onTap} />
			<button className="tap-button right" onTouchStart={onTap} />
		</div>
	);
}
