<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { ApiError, classesApi, type Class } from '$lib/api';

  const id = Number(page.params.id);

  let item = $state<Class | null>(null);
  let name = $state('');
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      item = await classesApi.get(id);
      name = item.name;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement de la classe';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      item = await classesApi.update(id, { name });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour de la classe';
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm('Supprimer cette classe ?')) return;
    try {
      await classesApi.remove(id);
      goto('/classes');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la suppression de la classe';
    }
  }
</script>

<a class="back-link" href="/classes">&larr; Retour aux classes</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>Classe n°{item.id}</h1>

  <form class="entity-form" onsubmit={submit}>
    <div class="field">
      <label for="name">Nom</label>
      <input id="name" type="text" bind:value={name} required />
    </div>

    <div class="form-actions">
      <button class="button" type="submit" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button class="button danger" type="button" onclick={remove}>Supprimer</button>
    </div>
  </form>

  <p class="meta">
    Créée le {new Date(item.created_at).toLocaleString()} · Modifiée le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
