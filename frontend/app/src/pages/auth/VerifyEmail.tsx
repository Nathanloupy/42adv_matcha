import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmail() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const { verifyEmail, isLoading, error } = useAuth();
	const calledRef = useRef(false);

	useEffect(() => {
		if (token && !calledRef.current) {
			calledRef.current = true;
			verifyEmail(token);
		}
	}, [token, verifyEmail]);

	if (!token) {
		return (
			<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm text-center">
					<h1 className="text-2xl font-bold">Invalid link</h1>
					<p className="mt-2 text-muted-foreground">
						This email verification link is invalid or has expired.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-full flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader>
						<CardTitle>
							{isLoading
								? "Verifying your email..."
								: error
									? "Verification failed"
									: "Email verified"}
						</CardTitle>
						<CardDescription>
							{isLoading
								? "Please wait while we verify your email address."
								: error
									? error.message
									: "Your email has been verified successfully."}
						</CardDescription>
					</CardHeader>
					{!isLoading && (
						<CardContent>
							{error ? (
								<p className="text-sm text-muted-foreground">
									The link may have expired. Please try
									signing up again or contact support.
								</p>
							) : (
								<Link
									to="/signin"
									className="text-sm underline-offset-4 hover:underline"
								>
									Sign in to your account
								</Link>
							)}
						</CardContent>
					)}
				</Card>
			</div>
		</div>
	);
}
