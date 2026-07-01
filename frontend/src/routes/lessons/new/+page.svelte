<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    ApiError,
    accountsApi,
    classesApi,
    lessonsApi,
    subjectsApi,
    type AccountWithProfile,
    type Class,
    type Subject,
  } from '$lib/api';

  let name = $state('');
  let classId = $state<number | null>(null);
  let teacherId = $state('');
  let subjectId = $state<number | null>(null);
  let saving = $state(false);
  let error = $state('');

  let classes = $state<Class[]>([]);
  let subjects = $state<Subject[]>([]);
  let teachers = $state<AccountWithProfile[]>([]);

  onMount(async () => {
    try {
      [classes, subjects, teachers] = await Promise.all([
        classesApi.list(),
        subjectsApi.list(),
        accountsApi.listTeachers(),
      ]);
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des classes/matières/enseignants';
    }
  });

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = '';
    try {
      const created = await lessonsApi.create({
        name: name || undefined,
        classId: classId ?? 0,
        teacherId,
        subjectId: subjectId ?? 0,
      });
      goto(`/lessons/${created.id}`);
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Échec de la création du cours';
    } finally {
      saving = false;
    }
  }
</script>

<a class="back-link" href="/lessons">&larr; Retour aux cours</a>
<h1>Nouveau cours</h1>

{#if error}
  <p class="error">{error}</p>
{/if}

<form class="entity-form" onsubmit={submit}>
  <div class="field">
    <label for="name">Nom (optionnel)</label>
    <input id="name" type="text" bind:value={name} />
  </div>

  <div class="field">
    <label for="classId">Classe</label>
    <select id="classId" bind:value={classId} required>
      <option value={null} disabled selected>Sélectionner une classe</option>
      {#each classes as c (c.id)}
        <option value={c.id}>{c.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="subjectId">Matière</label>
    <select id="subjectId" bind:value={subjectId} required>
      <option value={null} disabled selected>Sélectionner une matière</option>
      {#each subjects as s (s.id)}
        <option value={s.id}>{s.name}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="teacherId">Enseignant</label>
    <select id="teacherId" bind:value={teacherId} required>
      <option value="" disabled selected>Sélectionner un enseignant</option>
      {#each teachers as t (t.id)}
        <option value={t.id}>{t.profile.first_name} {t.profile.last_name}</option>
      {/each}
    </select>
  </div>

  <div class="form-actions">
    <button class="button" type="submit" disabled={saving}>
      {saving ? 'Enregistrement…' : 'Créer'}
    </button>
  </div>
</form>
