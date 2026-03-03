import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useProfile } from "../context/useProfile";
import { supabase } from "../lib/supabase";
import "./Feedback.css";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type Suggestion = {
	id: string;
	user_id: string;
	title: string;
	description: string;
	created_at: string;
	vote_count: number;
	has_voted: boolean;
};

type Poll = {
	id: string;
	question: string;
	is_active: boolean;
	created_at: string;
	options: PollOption[];
	user_vote: string | null;
};

type PollOption = {
	id: string;
	label: string;
	sort_order: number;
	vote_count: number;
};

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function Feedback() {
	const { user } = useAuth();
	const { isAdmin } = useProfile();
	const [tab, setTab] = useState<"suggestions" | "polls">("suggestions");

	return (
		<div className="feedback-page">
			<Link to="/" className="feedback-back-link">
				← Back to TapLabs
			</Link>

			<div className="feedback-hero">
				<h1>Feedback</h1>
				<p className="feedback-intro">
					Help shape TapLabs. Suggest features, vote on what matters, and
					respond to polls.
				</p>
			</div>

			<div className="coming-soon-section">
				<h2>Coming Soon</h2>
				<p className="coming-soon-intro">Features we're working on next.</p>

				<div className="coming-soon-list">
					<div className="coming-soon-item">
						<span className="coming-soon-icon">🥁</span>
						<div className="coming-soon-info">
							<h4>Metronome Sounds</h4>
							<p>
								Audible click track to help you internalize the beat while
								practicing.
							</p>
						</div>
						<span className="coming-soon-tag">Planned</span>
					</div>

					<div className="coming-soon-item">
						<span className="coming-soon-icon">🔊</span>
						<div className="coming-soon-info">
							<h4>Custom Hit Sounds</h4>
							<p>Choose from different hit sound packs or upload your own.</p>
						</div>
						<span className="coming-soon-tag">Planned</span>
					</div>

					<div className="coming-soon-item">
						<span className="coming-soon-icon">💻</span>
						<div className="coming-soon-info">
							<h4>Downloadable Client</h4>
							<p>
								Standalone desktop app with lower input latency and offline
								play.
							</p>
						</div>
						<span className="coming-soon-tag">Planned</span>
					</div>
				</div>
			</div>

			<div className="feedback-tabs">
				<button
					className={`feedback-tab ${tab === "suggestions" ? "active" : ""}`}
					onClick={() => setTab("suggestions")}
				>
					Suggestions
				</button>
				<button
					className={`feedback-tab ${tab === "polls" ? "active" : ""}`}
					onClick={() => setTab("polls")}
				>
					Polls
				</button>
			</div>

			{tab === "suggestions" ? (
				<SuggestionsTab user={user} />
			) : (
				<PollsTab user={user} isAdmin={isAdmin} />
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  SUGGESTIONS TAB                                                    */
/* ------------------------------------------------------------------ */

function SuggestionsTab({ user }: { user: { id: string } | null }) {
	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");

	const fetchSuggestions = async () => {
		const { data: suggestionsData } = await supabase
			.from("suggestions")
			.select("id, user_id, title, description, created_at");

		if (!suggestionsData) {
			setLoading(false);
			return;
		}

		const { data: votesData } = await supabase
			.from("suggestion_votes")
			.select("suggestion_id, user_id");

		const votes = votesData ?? [];

		const mapped: Suggestion[] = suggestionsData.map((s) => ({
			...s,
			description: s.description ?? "",
			vote_count: votes.filter((v) => v.suggestion_id === s.id).length,
			has_voted: user
				? votes.some((v) => v.suggestion_id === s.id && v.user_id === user.id)
				: false,
		}));

		setSuggestions(mapped);
		setLoading(false);
	};

	useEffect(() => {
		let cancelled = false;

		async function load() {
			const { data: suggestionsData } = await supabase
				.from("suggestions")
				.select("id, user_id, title, description, created_at");

			if (cancelled || !suggestionsData) {
				if (!cancelled) setLoading(false);
				return;
			}

			const { data: votesData } = await supabase
				.from("suggestion_votes")
				.select("suggestion_id, user_id");

			if (cancelled) return;

			const votes = votesData ?? [];

			setSuggestions(
				suggestionsData.map((s) => ({
					...s,
					description: s.description ?? "",
					vote_count: votes.filter((v) => v.suggestion_id === s.id).length,
					has_voted: user
						? votes.some(
								(v) => v.suggestion_id === s.id && v.user_id === user.id,
							)
						: false,
				})),
			);
			setLoading(false);
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [user]);

	const handleSubmit = async () => {
		if (!user || !title.trim()) return;
		setSubmitting(true);

		const { error } = await supabase.from("suggestions").insert([
			{
				user_id: user.id,
				title: title.trim(),
				description: description.trim(),
			},
		]);

		if (!error) {
			setTitle("");
			setDescription("");
			await fetchSuggestions();
		}
		setSubmitting(false);
	};

	const handleVote = async (suggestionId: string, hasVoted: boolean) => {
		if (!user) return;

		if (hasVoted) {
			await supabase
				.from("suggestion_votes")
				.delete()
				.eq("suggestion_id", suggestionId)
				.eq("user_id", user.id);
		} else {
			await supabase.from("suggestion_votes").insert([
				{
					suggestion_id: suggestionId,
					user_id: user.id,
				},
			]);
		}

		await fetchSuggestions();
	};

	const sorted = [...suggestions].sort((a, b) =>
		sortBy === "votes"
			? b.vote_count - a.vote_count
			: new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);

	return (
		<div className="suggestions-tab">
			{/* Submit form */}
			{user ? (
				<div className="suggestion-form">
					<h3>Submit a Suggestion</h3>
					<input
						type="text"
						placeholder="Feature or improvement idea..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						maxLength={120}
					/>
					<textarea
						placeholder="Optional details..."
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						maxLength={500}
					/>
					<button
						className="suggestion-submit-btn"
						onClick={handleSubmit}
						disabled={submitting || !title.trim()}
					>
						{submitting ? "Submitting..." : "Submit"}
					</button>
				</div>
			) : (
				<div className="feedback-login-prompt">
					Sign in to submit and vote on suggestions.
				</div>
			)}

			{/* Sort */}
			<div className="suggestion-sort">
				<button
					className={sortBy === "votes" ? "active" : ""}
					onClick={() => setSortBy("votes")}
				>
					Top
				</button>
				<button
					className={sortBy === "recent" ? "active" : ""}
					onClick={() => setSortBy("recent")}
				>
					Recent
				</button>
			</div>

			{/* List */}
			{loading ? (
				<div className="feedback-loading">Loading suggestions...</div>
			) : sorted.length === 0 ? (
				<div className="feedback-empty">No suggestions yet. Be the first!</div>
			) : (
				<div className="suggestion-list">
					{sorted.map((s) => (
						<div className="suggestion-card" key={s.id}>
							<button
								className={`vote-btn ${s.has_voted ? "voted" : ""}`}
								onClick={() => handleVote(s.id, s.has_voted)}
								disabled={!user}
								title={!user ? "Sign in to vote" : undefined}
							>
								<span className="vote-arrow">▲</span>
								<span className="vote-count">{s.vote_count}</span>
							</button>
							<div className="suggestion-content">
								<h4>{s.title}</h4>
								{s.description && <p>{s.description}</p>}
								<span className="suggestion-date">
									{new Date(s.created_at).toLocaleDateString()}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  POLLS TAB                                                          */
/* ------------------------------------------------------------------ */

function PollsTab({
	user,
	isAdmin,
}: {
	user: { id: string } | null;
	isAdmin: boolean;
}) {
	const [polls, setPolls] = useState<Poll[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchPolls = async () => {
		const { data: pollsData } = await supabase
			.from("polls")
			.select("id, question, is_active, created_at")
			.order("created_at", { ascending: false });

		if (!pollsData) {
			setLoading(false);
			return;
		}

		const { data: optionsData } = await supabase
			.from("poll_options")
			.select("id, poll_id, label, sort_order");

		const { data: votesData } = await supabase
			.from("poll_votes")
			.select("poll_id, poll_option_id, user_id");

		const options = optionsData ?? [];
		const votes = votesData ?? [];

		const mapped: Poll[] = pollsData.map((p) => {
			const pollOptions = options
				.filter((o) => o.poll_id === p.id)
				.sort((a, b) => a.sort_order - b.sort_order)
				.map((o) => ({
					...o,
					vote_count: votes.filter((v) => v.poll_option_id === o.id).length,
				}));

			const userVote = user
				? (votes.find((v) => v.poll_id === p.id && v.user_id === user.id)
						?.poll_option_id ?? null)
				: null;

			return { ...p, options: pollOptions, user_vote: userVote };
		});

		setPolls(mapped);
		setLoading(false);
	};

	useEffect(() => {
		let cancelled = false;

		async function load() {
			const { data: pollsData } = await supabase
				.from("polls")
				.select("id, question, is_active, created_at")
				.order("created_at", { ascending: false });

			if (cancelled || !pollsData) {
				if (!cancelled) setLoading(false);
				return;
			}

			const { data: optionsData } = await supabase
				.from("poll_options")
				.select("id, poll_id, label, sort_order");

			const { data: votesData } = await supabase
				.from("poll_votes")
				.select("poll_id, poll_option_id, user_id");

			if (cancelled) return;

			const options = optionsData ?? [];
			const votes = votesData ?? [];

			setPolls(
				pollsData.map((p) => {
					const pollOptions = options
						.filter((o) => o.poll_id === p.id)
						.sort((a, b) => a.sort_order - b.sort_order)
						.map((o) => ({
							...o,
							vote_count: votes.filter((v) => v.poll_option_id === o.id).length,
						}));

					const userVote = user
						? (votes.find((v) => v.poll_id === p.id && v.user_id === user.id)
								?.poll_option_id ?? null)
						: null;

					return { ...p, options: pollOptions, user_vote: userVote };
				}),
			);
			setLoading(false);
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [user]);

	const handleVote = async (pollId: string, optionId: string) => {
		if (!user) return;

		const { error } = await supabase.from("poll_votes").insert([
			{
				poll_id: pollId,
				poll_option_id: optionId,
				user_id: user.id,
			},
		]);

		if (!error) {
			await fetchPolls();
		}
	};

	return (
		<div className="polls-tab">
			{isAdmin && <PollCreator onCreated={fetchPolls} />}

			{loading ? (
				<div className="feedback-loading">Loading polls...</div>
			) : polls.length === 0 ? (
				<div className="feedback-empty">No polls yet. Check back later!</div>
			) : (
				<div className="poll-list">
					{polls.map((p) => (
						<PollCard key={p.id} poll={p} user={user} onVote={handleVote} />
					))}
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  POLL CARD                                                          */
/* ------------------------------------------------------------------ */

function PollCard({
	poll,
	user,
	onVote,
}: {
	poll: Poll;
	user: { id: string } | null;
	onVote: (pollId: string, optionId: string) => void;
}) {
	const totalVotes = poll.options.reduce((sum, o) => sum + o.vote_count, 0);
	const hasVoted = poll.user_vote !== null;
	const showResults = hasVoted || !poll.is_active;

	return (
		<div className={`poll-card ${!poll.is_active ? "poll-closed" : ""}`}>
			<div className="poll-header">
				<h3>{poll.question}</h3>
				{!poll.is_active && <span className="poll-closed-tag">Closed</span>}
			</div>

			<div className="poll-options">
				{poll.options.map((o) => {
					const pct = totalVotes > 0 ? (o.vote_count / totalVotes) * 100 : 0;
					const isSelected = poll.user_vote === o.id;

					return (
						<button
							key={o.id}
							className={`poll-option ${isSelected ? "selected" : ""} ${showResults ? "show-results" : ""}`}
							onClick={() =>
								!hasVoted && poll.is_active && user && onVote(poll.id, o.id)
							}
							disabled={hasVoted || !poll.is_active || !user}
						>
							{showResults && (
								<div
									className="poll-option-fill"
									style={{ width: `${pct}%` }}
								/>
							)}
							<span className="poll-option-label">{o.label}</span>
							{showResults && (
								<span className="poll-option-pct">{pct.toFixed(0)}%</span>
							)}
						</button>
					);
				})}
			</div>

			<div className="poll-meta">
				{totalVotes} {totalVotes === 1 ? "vote" : "votes"}
				{!user && poll.is_active && " · Sign in to vote"}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  ADMIN: POLL CREATOR                                                */
/* ------------------------------------------------------------------ */

function PollCreator({ onCreated }: { onCreated: () => void }) {
	const [open, setOpen] = useState(false);
	const [question, setQuestion] = useState("");
	const [options, setOptions] = useState(["", ""]);
	const [submitting, setSubmitting] = useState(false);

	const addOption = () => {
		if (options.length < 6) setOptions([...options, ""]);
	};

	const removeOption = (index: number) => {
		if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
	};

	const updateOption = (index: number, value: string) => {
		setOptions(options.map((o, i) => (i === index ? value : o)));
	};

	const handleCreate = async () => {
		const trimmedQ = question.trim();
		const trimmedOpts = options
			.map((o) => o.trim())
			.filter((o) => o.length > 0);

		if (!trimmedQ || trimmedOpts.length < 2) return;

		setSubmitting(true);

		const { data: poll, error: pollError } = await supabase
			.from("polls")
			.insert([{ question: trimmedQ }])
			.select("id")
			.single();

		if (pollError || !poll) {
			console.error("Failed to create poll:", pollError);
			setSubmitting(false);
			return;
		}

		const optionRows = trimmedOpts.map((label, i) => ({
			poll_id: poll.id,
			label,
			sort_order: i,
		}));

		const { error: optError } = await supabase
			.from("poll_options")
			.insert(optionRows);

		if (optError) {
			console.error("Failed to create poll options:", optError);
		}

		setQuestion("");
		setOptions(["", ""]);
		setSubmitting(false);
		setOpen(false);
		onCreated();
	};

	if (!open) {
		return (
			<button className="poll-create-toggle" onClick={() => setOpen(true)}>
				+ Create Poll
			</button>
		);
	}

	return (
		<div className="poll-creator">
			<h3>Create a Poll</h3>

			<input
				type="text"
				placeholder="Poll question..."
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				maxLength={200}
			/>

			<div className="poll-creator-options">
				{options.map((opt, i) => (
					<div className="poll-creator-option-row" key={i}>
						<input
							type="text"
							placeholder={`Option ${i + 1}`}
							value={opt}
							onChange={(e) => updateOption(i, e.target.value)}
							maxLength={100}
						/>
						{options.length > 2 && (
							<button
								className="poll-creator-remove"
								onClick={() => removeOption(i)}
							>
								✕
							</button>
						)}
					</div>
				))}
			</div>

			{options.length < 6 && (
				<button className="poll-creator-add" onClick={addOption}>
					+ Add Option
				</button>
			)}

			<div className="poll-creator-actions">
				<button
					className="poll-creator-submit"
					onClick={handleCreate}
					disabled={
						submitting ||
						!question.trim() ||
						options.filter((o) => o.trim()).length < 2
					}
				>
					{submitting ? "Creating..." : "Create Poll"}
				</button>
				<button className="poll-creator-cancel" onClick={() => setOpen(false)}>
					Cancel
				</button>
			</div>
		</div>
	);
}
