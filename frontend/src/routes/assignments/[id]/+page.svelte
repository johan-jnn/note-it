<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { ApiError, assignmentsApi, lessonsApi, type Assignment, type Lesson } from '$lib/api';

  const id = Number(page.params.id);

  let item = $state<Assignment | null>(null);
  let title = $state('');
  let scale = $state<number | null>(null);
  let coefficient = $state<number | null>(null);
  let begin_date = $state('');
  let end_date = $state('');
  let lessonId = $state<number | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  let lessons = $state<Lesson[]>([]);

  onMount(load);

  function toDateInput(value: string | null): string {
    return value ? value.slice(0, 10) : '';
  }

  async function load() {
    loading = true;
    error = '';
    try {
      [item, lessons] = await Promise.all([assignmentsApi.get(id), lessonsApi.list()]);
      title = item.title;
      scale = item.scale;
      coefficient = item.coefficient;
      begin_date = toDateInput(item.begin_date);
      end_date = toDateInput(item.end_date);
      lessonId = item.lesson.id;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement du devoir';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      item = await assignmentsApi.update(id, {
        title,
        scale: scale ?? 0,
        coefficient: coefficient ?? undefined,
        begin_date: begin_date || undefined,
        end_date: end_date || undefined,
        lessonId: lessonId ?? undefined,
      });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour du devoir';
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm('Supprimer ce devoir ?')) return;
    try {
      await assignmentsApi.remove(id);
      goto('/assignments');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la suppression du devoir';
    }
  }
</script>

<a class="back-link" href="/assignments">&larr; Retour aux devoirs</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>Devoir n°{item.id}</h1>

  <form class="entity-form" onsubmit={submit}>
    <div class="field">
      <label for="title">Titre</label>
      <input id="title" type="text" bind:value={title} required />
    </div>

    <div class="field">
      <label for="scale">Barème</label>
      <input id="scale" type="number" min="0" bind:value={scale} required />
    </div>

    <div class="field">
      <label for="coefficient">Coefficient</label>
      <input id="coefficient" type="number" step="0.01" bind:value={coefficient} />
    </div>

    <div class="field">
      <label for="begin_date">Date de début</label>
      <input id="begin_date" type="date" bind:value={begin_date} />
    </div>

    <div class="field">
      <label for="end_date">Date de fin</label>
      <input id="end_date" type="date" bind:value={end_date} />
    </div>

    <div class="field">
      <label for="lessonId">Cours</label>
      <select id="lessonId" bind:value={lessonId} required>
        {#each lessons as l (l.id)}
          <option value={l.id}>{l.real_name}</option>
        {/each}
      </select>
    </div>

    <div class="form-actions">
      <button class="button" type="submit" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button class="button danger" type="button" onclick={remove}>Supprimer</button>
    </div>
  </form>

  <p class="meta">Cours : {item.lesson.real_name}</p>

  <p class="meta">
    Créé le {new Date(item.created_at).toLocaleString()} · Modifié le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
