import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Browse from "./pages/browse/Browse";
import Messages from "./pages/messages/Messages";
import Conversation from "./pages/messages/Conversation";
import Likes from "./pages/likes/Likes";
import Profile from "./pages/profile/Profile";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import RequestResetPassword from "./pages/auth/RequestResetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import NotFound from "./pages/NotFound";

export default function App() {
	return (
		<div className="h-screen flex flex-col">
			<Header />

			<main className="flex-1 overflow-y-auto">
				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Browse />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/messages"
						element={
							<ProtectedRoute>
								<Messages />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/messages/:id"
						element={
							<ProtectedRoute>
								<Conversation />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/likes"
						element={
							<ProtectedRoute>
								<Likes />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>
					<Route path="/signin" element={<SignIn />} />
					<Route path="/signup" element={<SignUp />} />
					<Route
						path="/request-reset-password"
						element={<RequestResetPassword />}
					/>
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/verify-email" element={<VerifyEmail />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>

			<Footer />
			<Toaster expand visibleToasts={1} position="top-center" />
		</div>
	);
}
