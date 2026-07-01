<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, lessonsApi, type Lesson } from '$lib/api';

  let items = $state<Lesson[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(load);

  async function load() {
    loading = true;
    error = '';
    try {
      items = await lessonsApi.list();
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Échec du chargement des cours';
    } finally {
      loading = false;
    }
  }

  function openItem(id: number) {
    goto(`/lessons/${id}`);
  }
</script>

<div class="actions-row">
  <h1>Cours</h1>
  <a class="button" href="/lessons/new">+ Ajouter</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Chargement…</p>
{:else if items.length === 0}
  <p>Aucun cours pour le moment.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>Classe</th>
        <th>Matière</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr class="clickable" onclick={() => openItem(item.id)}>
          <td>{item.id}</td>
          <td>{item.real_name}</td>
          <td>{item.class.name}</td>
          <td>{item.subject.name}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
