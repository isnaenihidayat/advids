"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Welcome to AdvIDs</h1>
        <p>Please log in to continue.</p>
        <a href="/api/auth/signin">Sign In</a>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {user.email}</h1>
      <p>Phase 1 Foundation Setup Complete</p>
      <ul>
        <li>✓ Monorepo structure (backend + frontend)</li>
        <li>✓ PostgreSQL schema with Prisma ORM</li>
        <li>✓ User authentication (NextAuth.js ready)</li>
        <li>✓ Environment configuration</li>
        <li>✓ Basic API structure with auth middleware</li>
      </ul>
      <a href="/api/auth/signout">Sign Out</a>
    </div>
  );
}