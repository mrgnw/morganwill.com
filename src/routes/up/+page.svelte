<script>
  import IdeaItem from '$components/IdeaItem.svelte';
  
  let ideas = $state([]);
  let sortBy = $state('created_at');
  let filterTag = $state('');

  $effect(() => {
    // Simulating API call
    setTimeout(() => {
      ideas = [
        {
          id: 1,
          title: 'AI-powered content generator',
          description: 'Create an AI tool that generates blog posts and articles based on user prompts.',
          tags: ['AI', 'content', 'writing'],
          votes: 10,
          value: 5,
          created_at: Date.now() - 86400000 * 2, // 2 days ago
        },
        {
          id: 2,
          title: 'Sustainable energy marketplace',
          description: 'Develop a platform connecting renewable energy producers with consumers.',
          tags: ['energy', 'sustainability', 'marketplace'],
          votes: 15,
          value: 8,
          created_at: Date.now() - 86400000, // 1 day ago
        },
        {
          id: 3,
          title: 'Virtual reality fitness app',
          description: 'Create an immersive VR fitness experience with personalized workouts.',
          tags: ['VR', 'fitness', 'health'],
          votes: 8,
          value: 6,
          created_at: Date.now() - 3600000, // 1 hour ago
        },
      ];
    }, 500);
  });

  const sortedAndFilteredIdeas = $derived(
    ideas
      .filter(idea => filterTag === '' || idea.tags.includes(filterTag))
      .sort((a, b) => {
        if (sortBy === 'created_at') return b.created_at - a.created_at;
        if (sortBy === 'most_voted') return b.votes - a.votes;
        if (sortBy === 'most_valuable') return b.value - a.value;
        return 0;
      })
  );

  const tags = $derived([...new Set(ideas.flatMap(idea => idea.tags))]);

  function handleUpvote(id) {
    ideas = ideas.map(idea => 
      idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
    );
  }

  function handleValueVote(id) {
    ideas = ideas.map(idea => 
      idea.id === id ? { ...idea, value: idea.value + 1 } : idea
    );
  }
</script>

<main class="container mx-auto p-4">
  <h1 class="text-3xl font-bold mb-4">Idea Voter</h1>
  
  <div class="mb-4 flex flex-wrap gap-4">
    <div>
      <label for="sort" class="mr-2">Sort by:</label>
      <select id="sort" onchange={e => sortBy = e.target.value} class="p-2 border rounded">
        <option value="created_at">Newest</option>
        <option value="most_voted">Most Voted</option>
        <option value="most_valuable">Most Valuable</option>
      </select>
    </div>

    <div>
      <label for="filter" class="mr-2">Filter by tag:</label>
      <select id="filter" onchange={e => filterTag = e.target.value} class="p-2 border rounded">
        <option value="">All</option>
        {#each tags as tag}
          <option value={tag}>{tag}</option>
        {/each}
      </select>
    </div>
  </div>

  <ul class="space-y-4">
    {#each sortedAndFilteredIdeas as idea (idea.id)}
      <IdeaItem {idea} onUpvote={handleUpvote} onValueVote={handleValueVote} />
    {/each}
  </ul>
</main>

<style>
  :global(body) {
    background-color: #f3f4f6;
  }
</style>