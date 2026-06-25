"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { BackButton } from "../../components/back-button";
import {
  type ProfileSettings,
  useProfileSettings,
} from "../../lib/profile";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileSettings();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [location, setLocation] = useState(profile.location);
  const [visibility, setVisibility] =
    useState<ProfileSettings["visibility"]>(profile.visibility);
  const [bio, setBio] = useState(profile.bio);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setHandle(profile.handle);
    setLocation(profile.location);
    setVisibility(profile.visibility);
    setBio(profile.bio);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    updateProfile({
      displayName: displayName.trim() || profile.displayName,
      handle: handle.trim() || profile.handle,
      location: location.trim(),
      visibility,
      bio: bio.trim() || profile.bio,
    });
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      router.push("/profile");
    }, 520);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Profile" />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <header className="px-1 pb-2 pt-4 sm:px-4">
            <BackButton />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Edit Profile
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Tune how your progress shows up.
            </h1>
          </header>

          <form className="board-form rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-black text-zinc-700">
                Display name
                <input
                  className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  type="text"
                />
              </label>

              <label className="block text-sm font-black text-zinc-700">
                Profile visibility
                <select
                  className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(event.target.value as ProfileSettings["visibility"])
                  }
                >
                  <option>Public</option>
                  <option>Clique only</option>
                  <option>Private</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-black text-zinc-700">
                Handle
                <input
                  className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="@valentino"
                  type="text"
                />
              </label>

              <label className="block text-sm font-black text-zinc-700">
                Location
                <input
                  className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Orange County, CA"
                  type="text"
                />
              </label>
            </div>

            <label className="mt-5 block text-sm font-black text-zinc-700">
              Bio
              <textarea
                className="board-input mt-3 min-h-32 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base font-medium leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
              />
            </label>

            <button
              className="profile-primary-button mt-6 h-12 w-full cursor-pointer rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              type="button"
              onClick={handleSave}
            >
              {saved ? "Saved" : "Save Profile"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
