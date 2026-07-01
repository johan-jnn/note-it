<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import {
    ApiError,
    accountsApi,
    classesApi,
    lessonsApi,
    subjectsApi,
    type AccountWithProfile,
    type Class,
    type Lesson,
    type Subject,
  } from '$lib/api';

  const id = Number(page.params.id);

  let item = $state<Lesson | null>(null);
  let name = $state('');
  let classId = $state<number | null>(null);
  let teacherId = $state('');
  let subjectId = $state<number | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  let classes = $state<Class[]>([]);
  let subjects = $state<Subject[]>([]);
  let teachers = $state<AccountWithProfile[]>([]);

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      [item, classes, subjects, teachers] = await Promise.all([
        lessonsApi.get(id),
        classesApi.list(),
        subjectsApi.list(),
        accountsApi.listTeachers(),
      ]);
      name = item.name ?? '';
      classId = item.class.id;
      teacherId = item.teacher.id;
      subjectId = item.subject.id;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement du cours';
    } finally {
      loading = false;
    }
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      item = await lessonsApi.update(id, {
        name: name || undefined,
        classId: classId ?? undefined,
        teacherId: teacherId || undefined,
        subjectId: subjectId ?? undefined,
      });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la mise à jour du cours';
    } finally {
      saving = false;
    }
  }

  async function remove() {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
      await lessonsApi.remove(id);
      goto('/lessons');
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la suppression du cours';
    }
  }
</script>

<a class="back-link" href="/lessons">&larr; Retour aux cours</a>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if item}
  <h1>Cours n°{item.id} — {item.real_name}</h1>

  <form class="entity-form" onsubmit={submit}>
    <div class="field">
      <label for="name">Nom (optionnel)</label>
      <input id="name" type="text" bind:value={name} />
    </div>

    <div class="field">
      <label for="classId">Classe</label>
      <select id="classId" bind:value={classId} required>
        {#each classes as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="subjectId">Matière</label>
      <select id="subjectId" bind:value={subjectId} required>
        {#each subjects as s (s.id)}
          <option value={s.id}>{s.name}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="teacherId">Enseignant</label>
      <select id="teacherId" bind:value={teacherId} required>
        {#each teachers as t (t.id)}
          <option value={t.id}>{t.profile.first_name} {t.profile.last_name}</option>
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

  <p class="meta">Enseignant : {item.teacher.first_name} {item.teacher.last_name}</p>

  <p class="meta">
    Créé le {new Date(item.created_at).toLocaleString()} · Modifié le {new Date(
      item.updated_at,
    ).toLocaleString()}
  </p>
{/if}
