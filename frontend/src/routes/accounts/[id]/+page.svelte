<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import {
    AccountsType,
    ApiError,
    accountsApi,
    classesApi,
    type AccountWithProfile,
    type Class,
  } from '$lib/api';

  const id = page.params.id as string;

  let item = $state<AccountWithProfile | null>(null);
  let email = $state('');
  let first_name = $state('');
  let last_name = $state('');
  let classId = $state<number | null>(null);
  let directorId = $state('');

  let classes = $state<Class[]>([]);
  let directors = $state<AccountWithProfile[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      item = await accountsApi.get(id);
      email = item.email;
      first_name = item.profile.first_name;
      last_name = item.profile.last_name;

      if (item.type === AccountsType.Student) {
        classes = await classesApi.list();
        classId = (item.profile as unknown as { class: Class }).class.id;
      } else {
        const allDirectors = await accountsApi.listDirectors();
        directors = allDirectors.filter((d) => d.id !== id);
        directorId = (item.profile as { director?: { id: string } }).director?.id ?? '';
      }
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement du compte';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!item) return;
    saving = true;
    error = '';
    try {
      item = await accountsApi.update(id, {
        email,
        first_name,
        last_name,
        classId: item.type === AccountsType.Student ? (classId ?? undefined) : undefined,
        directorId: item.type === AccountsType.Teacher ? (directorId || null) : undefined,
      });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour du compte';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/accounts">&larr; Retour aux comptes</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>{item.profile.first_name} {item.profile.last_name}</h1>
  <p class="meta">Type : {item.type === AccountsType.Student ? 'Élève' : 'Enseignant'}</p>

  <form class="entity-form" onsubmit={submit}>
    <div class="field">
      <label for="email">Email</label>
      <input id="email" type="email" bind:value={email} required />
    </div>

    <div class="field">
      <label for="first_name">Prénom</label>
      <input id="first_name" type="text" bind:value={first_name} required />
    </div>

    <div class="field">
      <label for="last_name">Nom</label>
      <input id="last_name" type="text" bind:value={last_name} required />
    </div>

    {#if item.type === AccountsType.Student}
      <div class="field">
        <label for="classId">Classe</label>
        <select id="classId" bind:value={classId} required>
          {#each classes as c (c.id)}
            <option value={c.id}>{c.name}</option>
          {/each}
        </select>
      </div>
    {:else}
      <div class="field">
        <label for="directorId">Directeur (optionnel)</label>
        <select id="directorId" bind:value={directorId}>
          <option value="">Aucun (cet enseignant est lui-même directeur)</option>
          {#each directors as d (d.id)}
            <option value={d.id}>{d.profile.first_name} {d.profile.last_name}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div class="form-actions">
      <button class="button" type="submit" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  </form>

  <p class="meta">
    Créé le {new Date(item.created_at).toLocaleString()} · Modifié le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
