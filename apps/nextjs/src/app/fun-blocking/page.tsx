"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { Layout } from "~/app/_components/Layout";
import { api } from "~/trpc/react";

type DomainBlocking = RouterOutputs["domainBlocking"]["getAll"][number];

export default function FunBlockingPage() {
  const [newDomain, setNewDomain] = useState("");
  const [showPermissionsButton, setShowPermissionsButton] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [permissionsNonce, setPermissionsNonce] = useState(0);
  const utils = api.useUtils();
  const { data: domainBlockings } = api.domainBlocking.getAll.useQuery();
  const createDomainBlocking = api.domainBlocking.create.useMutation({
    onSuccess: () => {
      setNewDomain("");
      void utils.domainBlocking.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDomain.trim()) {
      createDomainBlocking.mutate({ domain: newDomain.trim() });
    }
  };

  React.useEffect(() => {
    async function getPermissions() {
      // @ts-expect-error - hacky way to get the electron api
      if (typeof window.createT3TurboElectron !== "undefined") {
        // @ts-expect-error - hacky way to get the electron api
        // eslint-disable-next-line
        const res = await window.createT3TurboElectron.getPermissions();
        if (res != "666") {
          setShowPermissionsButton(true);
        }
      }
    }
    // eslint-disable-next-line
    getPermissions();
  }, [permissionsNonce]);

  React.useEffect(() => {
    // @ts-expect-error - hacky way to get the electron api
    setIsElectron(typeof window.createT3TurboElectron !== "undefined");
  }, []);

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Fun Blocking</h1>
        {!isElectron && (
          <p>
            Domain blocking will only work if you are running the Electron App.
          </p>
        )}

        {showPermissionsButton && (
          <div>
            {" "}
            <p>
              In order to enable domain blocking, you must install (and keep
              running) the Electron App version of fitt.buzz and click the "set
              permissions" button
            </p>
            <Button
              onClick={async () => {
                // @ts-expect-error - hacky way to get the electron api
                // eslint-disable-next-line
                await window.createT3TurboElectron.setPermissions();
                setPermissionsNonce(permissionsNonce + 1);
              }}
            >
              Set Permissions
            </Button>
          </div>
        )}
        <p>
          Blocking may take several minutes to take effect (an overdue task will
          not immediately cause websites to be blocked), but the unblocking of
          websites should happen immediately upon completing the necessary tasks
        </p>

        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter domain to block"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newDomain.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Blocked Domains</h2>
          {domainBlockings?.length === 0 ? (
            <p className="text-muted-foreground">No domains blocked yet.</p>
          ) : (
            <div className="grid gap-4">
              {domainBlockings?.map((blocking: DomainBlocking) => (
                <div
                  key={blocking.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{blocking.domain}</span>
                    <span className="text-sm text-muted-foreground">
                      Added {new Date(blocking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
