"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const profileStorageKey = "brag.profile.v1";

export type ProfileSettings = {
  displayName: string;
  handle: string;
  location: string;
  visibility: "Public" | "Clique only" | "Private";
  bio: string;
};

export const defaultProfile: ProfileSettings = {
  displayName: "Valentino Cavaricci",
  handle: "@valentino",
  location: "Orange County, CA",
  visibility: "Public",
  bio: "Keeping proof of the work: books finished, miles logged, ideas built, and a life in progress.",
};

function readProfile(): ProfileSettings {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const raw = window.localStorage.getItem(profileStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      ...defaultProfile,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
  } catch {
    return defaultProfile;
  }
}

function writeProfile(profile: ProfileSettings) {
  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
  window.dispatchEvent(new Event("profile:updated"));
}

export function useProfileSettings() {
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const sync = () => setProfile(readProfile());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("profile:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("profile:updated", sync);
    };
  }, []);

  const updateProfile = useCallback((updates: Partial<ProfileSettings>) => {
    const next = { ...readProfile(), ...updates };
    writeProfile(next);
    setProfile(next);
  }, []);

  return useMemo(
    () => ({ profile, updateProfile }),
    [profile, updateProfile],
  );
}
