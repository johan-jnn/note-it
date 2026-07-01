<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { ApiError, subjectsApi, type Subject } from '$lib/api';

  const id = Number(page.params.id);

  let item = $state<Subject | null>(null);
  let name = $state('');
  let description = $state('');
  let ownerId = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      item = await subjectsApi.get(id);
      name = item.name;
      description = item.description ?? '';
      ownerId = item.owner.id;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement de la matière';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      item = await subjectsApi.update(id, {
        name,
        description: description || undefined,
        ownerId,
      });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour de la matière';
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      await subjectsApi.remove(id);
      goto('/subjects');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la suppression de la matière';
    }
  }
</script>

<a class="back-link" href="/subjects">&larr; Retour aux matières</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>Matière n°{item.id}</h1>

  <form class="entity-form" onsubmit={submit}>
    <div class="field">
      <label for="name">Nom</label>
      <input id="name" type="text" bind:value={name} required />
    </div>

    <div class="field">
      <label for="description">Description</label>
      <textarea id="description" bind:value={description}></textarea>
    </div>

    <div class="field">
      <label for="ownerId">Propriétaire (UUID enseignant)</label>
      <input id="ownerId" type="text" bind:value={ownerId} required />
    </div>

    <div class="form-actions">
      <button class="button" type="submit" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button class="button danger" type="button" onclick={remove}>Supprimer</button>
    </div>
  </form>

  <p class="meta">Propriétaire : {item.owner.first_name} {item.owner.last_name}</p>

  <p class="meta">
    Créée le {new Date(item.created_at).toLocaleString()} · Modifiée le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
