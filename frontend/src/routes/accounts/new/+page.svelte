<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    AccountsType,
    ApiError,
    accountsApi,
    classesApi,
    type AccountWithProfile,
    type Class,
  } from '$lib/api';

  let email = $state('');
  let type = $state<AccountsType>(AccountsType.Student);
  let first_name = $state('');
  let last_name = $state('');
  let classId = $state<number | null>(null);
  let directorId = $state('');

  let classes = $state<Class[]>([]);
  let directors = $state<AccountWithProfile[]>([]);
  let saving = $state(false);
  let error = $state('');

  onMount(async () => {
    try {
      [classes, directors] = await Promise.all([classesApi.list(), accountsApi.listDirectors()]);
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des classes/directeurs';
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      await accountsApi.create({
        email,
        type,
        first_name,
        last_name,
        classId: type === AccountsType.Student ? (classId ?? undefined) : undefined,
        directorId: type === AccountsType.Teacher ? (directorId || undefined) : undefined,
      });
      goto('/accounts');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création du compte';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/accounts">&larr; Retour aux comptes</a>
<h1>Nouveau compte</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} required />
  </div>

  <div class="field">
    <label for="type">Type de compte</label>
    <select id="type" bind:value={type}>
      <option value={AccountsType.Student}>Élève</option>
      <option value={AccountsType.Teacher}>Enseignant</option>
    </select>
  </div>

  <div class="field">
    <label for="first_name">Prénom</label>
    <input id="first_name" type="text" bind:value={first_name} required />
  </div>

  <div class="field">
    <label for="last_name">Nom</label>
    <input id="last_name" type="text" bind:value={last_name} required />
  </div>

  {#if type === AccountsType.Student}
    <div class="field">
      <label for="classId">Classe</label>
      <select id="classId" bind:value={classId} required>
        <option value={null} disabled selected>Sélectionner une classe</option>
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
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
