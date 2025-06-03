<script>
  let ratings = $state({});
  let tapCounts = {};
  let tapTimers = {};

  const allTechs = {
    fullStack: [
      'MongoDB', 'Express.js', 'Angular', 'Node.js',
      'React', 'Linux', 'Apache', 'MySQL', 'PHP',
      'Django', 'PostgreSQL', 'Redis', 'Ruby', 'Rails',
      'Next.js', 'Vercel', 'TypeScript', 'tRPC', 'Prisma',
      'Tailwind', 'SvelteKit', 'Nuxt.js', 'Vue.js'
    ],
    backend: [
      'Express.js', 'Fastify', 'NestJS', 'Django', 'FastAPI',
      'Flask', 'SQLAlchemy', 'Spring Boot', 'Hibernate',
      'Maven', 'Gradle', 'ASP.NET Core', 'Entity Framework',
      'NuGet', 'Gin', 'Echo', 'GORM', 'gorilla/mux',
      'Actix-web', 'Rocket', 'Diesel', 'Tokio', 'Ruby on Rails',
      'Sinatra', 'ActiveRecord', 'Laravel', 'Symfony',
      'CodeIgniter', 'Phoenix', 'Ecto', 'OTP', 'Play Framework',
      'Akka', 'Slick'
    ],
    dataEngineering: [
      'Apache Spark', 'Scala', 'Python', 'Hadoop', 'HDFS',
      'Yarn', 'dbt', 'Snowflake', 'Fivetran', 'Looker',
      'S3', 'Glue', 'EMR', 'Redshift', 'Kinesis', 'Lambda',
      'BigQuery', 'Dataflow', 'Pub/Sub', 'Cloud Functions',
      'Synapse', 'Data Factory', 'Event Hubs', 'Functions',
      'Apache Kafka', 'Kafka Connect', 'KSQL', 'Schema Registry',
      'Apache Airflow', 'Celery', 'Apache Storm', 'Apache Flink',
      'Kafka Streams', 'Pandas', 'NumPy', 'Jupyter', 'Apache Beam',
      'Delta Lake', 'Apache Iceberg', 'Apache Hudi'
    ],
    databases: [
      'PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'MongoDB',
      'Cassandra', 'DynamoDB', 'CouchDB', 'Neo4j', 'Amazon Neptune',
      'ArangoDB', 'InfluxDB', 'TimescaleDB', 'Prometheus', 'Redis',
      'Memcached', 'Hazelcast', 'Elasticsearch', 'Solr', 'Algolia'
    ],
    cloud: [
      'AWS', 'EC2', 'S3', 'RDS', 'Lambda', 'ECS', 'EKS',
      'Google Cloud', 'Compute Engine', 'Cloud Storage', 'Cloud SQL',
      'Azure', 'Virtual Machines', 'Blob Storage', 'SQL Database',
      'Vercel', 'Netlify', 'Cloudflare Pages', 'Railway'
    ]
  };

  const sortedRatedTechs = $derived(() => {
    return Object.entries(ratings)
      .filter(([tech, rating]) => rating !== null && rating !== undefined)
      .sort((a, b) => b[1] - a[1]);
  });

  const allTechsList = $derived(() => {
    const allTechsFlat = [
      ...allTechs.fullStack,
      ...allTechs.backend,
      ...allTechs.dataEngineering,
      ...allTechs.databases,
      ...allTechs.cloud
    ];
    
    return [...new Set(allTechsFlat)]
      .map(tech => [tech, ratings[tech] ?? null])
      .sort((a, b) => {
        const aRating = a[1] ?? 0;
        const bRating = b[1] ?? 0;
        return bRating - aRating;
      });
  });

  function incrementRating(tech) {
    if (ratings[tech] === undefined || ratings[tech] === null) {
      ratings[tech] = 1;
    } else {
      ratings[tech] = Math.min(5, ratings[tech] + 1);
    }
  }

  function decrementRating(tech) {
    if (ratings[tech] === undefined || ratings[tech] === null) {
      ratings[tech] = -1;
    } else {
      ratings[tech] = Math.max(-5, ratings[tech] - 1);
    }
  }

  function handleTechClick(tech, event) {
    if (event.altKey || event.metaKey) {
      decrementRating(tech);
      return;
    }

    if (!tapCounts[tech]) {
      tapCounts[tech] = 1;
      tapTimers[tech] = setTimeout(() => {
        incrementRating(tech);
        tapCounts[tech] = 0;
      }, 300);
    } else if (tapCounts[tech] === 1) {
      clearTimeout(tapTimers[tech]);
      decrementRating(tech);
      tapCounts[tech] = 0;
    }
  }

  function getRatingColor(rating) {
    if (rating === null || rating === undefined) return 'text-gray-400';
    if (rating === 0) return 'text-gray-600';
    if (rating > 0) return 'text-green-600';
    return 'text-red-600';
  }

  function getRatingDisplay(rating) {
    if (rating === null || rating === undefined) return '';
    if (rating === 0) return ' (0)';
    return ` (${rating > 0 ? '+' : ''}${rating})`;
  }
</script>

{#snippet techButton(tech)}
  <button
    class="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors select-none {getRatingColor(ratings[tech])}"
    style="touch-action: manipulation;"
    onclick={(e) => handleTechClick(tech, e)}
  >
    {tech}{getRatingDisplay(ratings[tech])}
  </button>
{/snippet}

<div class="p-6 max-w-4xl mx-auto select-none">
  <h1 class="text-3xl font-bold mb-4">Tech Stack Ratings</h1>
  <p class="text-sm text-gray-600 mb-6">
    Single tap to rate (+1). Double tap to decrease (-1). Alt/Cmd+Click also works.
    <br>Positive = like, Negative = dislike, 0 = neutral, blank = don't use
  </p>
  
  <section class="mb-8">
    <h2 class="text-2xl font-semibold mb-4">All Technologies (Sorted by Rating)</h2>
    <div class="flex flex-wrap gap-2">
      {#each allTechsList as [tech, rating]}
        {@render techButton(tech)}
      {/each}
    </div>
  </section>
  
  <div class="space-y-8">
    <section>
      <h2 class="text-2xl font-semibold mb-4">Full Stack</h2>
      <div class="flex flex-wrap gap-2">
        {#each allTechs.fullStack as tech}
          {@render techButton(tech)}
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Backend</h2>
      <div class="flex flex-wrap gap-2">
        {#each allTechs.backend as tech}
          {@render techButton(tech)}
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Data Engineering</h2>
      <div class="flex flex-wrap gap-2">
        {#each allTechs.dataEngineering as tech}
          {@render techButton(tech)}
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Databases</h2>
      <div class="flex flex-wrap gap-2">
        {#each allTechs.databases as tech}
          {@render techButton(tech)}
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Cloud Platforms</h2>
      <div class="flex flex-wrap gap-2">
        {#each allTechs.cloud as tech}
          {@render techButton(tech)}
        {/each}
      </div>
    </section>
  </div>
</div>