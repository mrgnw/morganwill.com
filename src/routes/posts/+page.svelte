<script>
    /** @type {import('./$types').PageData} */
    export let data;
  </script>
  
  <h1>Posts</h1>
  <ul>
    {#each data.posts as post}
      <li>
        <a href={`/posts/${post.slug}`}>{post.title}</a>
        {#if post.date}
          <span> - {new Date(post.date).toLocaleDateString()}</span>
        {/if}
      </li>
    {/each}
  </ul>