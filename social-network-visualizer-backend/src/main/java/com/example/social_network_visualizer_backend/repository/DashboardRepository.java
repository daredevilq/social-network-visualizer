package com.example.social_network_visualizer_backend.repository;

import com.example.social_network_visualizer_backend.dto.*;
import com.example.social_network_visualizer_backend.dto.author.TopAuthorsDto;
import com.example.social_network_visualizer_backend.dto.community.ActivityHeatmap;
import com.example.social_network_visualizer_backend.model.Author;
import java.util.List;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;

public interface DashboardRepository extends Neo4jRepository<Author, String> {
  @Query(
      """
                MATCH (a:Author)-[r1:POSTED]->(t:Tweet)
                OPTIONAL MATCH (t)-[r2:HAS_HASHTAG]->(h:Hashtag)
                OPTIONAL MATCH (t)-[r3:MENTIONS]->(:Author)
                OPTIONAL MATCH (t)-[r4:REPLY_TO]->(:Tweet)
                OPTIONAL MATCH (t)-[r5:PARENT]->(:Tweet)

                WITH
                    collect(DISTINCT t) AS tweets,
                    collect(DISTINCT a) AS authors,
                    collect(DISTINCT h) AS hashtags,
                    count(r1) AS authorRelationsCount,
                    count(r2) AS hashtagRelationsCount,
                    count(r3) AS mentionsCount,
                    count(r4) AS repliesCount,
                    count(r5) AS parentRelationsCount,
                    collect(DISTINCT a.community) AS communityIds,
                    sum(CASE WHEN t.objectType = "RETWEET" THEN 1 ELSE 0 END) AS retweetCount

                RETURN
                    size(tweets) AS tweetsCount,
                    size(authors) AS usersCount,
                    size(hashtags) AS hashtagsCount,
                    (mentionsCount + repliesCount + parentRelationsCount + hashtagRelationsCount + authorRelationsCount) AS relationsCount,
                    size([c IN communityIds WHERE c IS NOT NULL]) AS communitiesCount,
                    retweetCount
            """)
  ProjectStatsDto getProjectStats();

  @Query(
      """
                MATCH (t:Tweet)
                WITH date(t.publicationDate) AS day, count(t) AS posts
                ORDER BY day
                RETURN day, posts
            """)
  List<ActivityPoint> getProjectActivity();

  @Query(
      """
                MATCH (t:Tweet)-[:MENTION]->(a:Author)
                RETURN
                    a.userName AS username,
                    COUNT(*) AS count
                ORDER BY count DESC
                LIMIT 5
            """)
  List<TopAuthorsDto> findTopMentions();

  @Query(
      """
                MATCH (a:Author)-[:POSTED]->(t:Tweet)
                RETURN
                    a.userName AS username,
                    COUNT(*) AS count
                ORDER BY count DESC
                LIMIT 5
            """)
  List<TopAuthorsDto> findTopAuthors();

  @Query(
      """
                UNWIND range(0,23) AS h
                UNWIND range(1,7) AS d
                OPTIONAL MATCH (a:Author)-[:POSTED]->(t:Tweet)
                   WHERE t.publicationDate.hour = h
                   AND t.publicationDate.dayOfWeek = d
                WITH  h, d, count(t)   AS posts
                RETURN h AS hour, d AS dayOfWeek, posts
                ORDER  BY d, h;
            """)
  List<ActivityHeatmap> getProjectHeatMap();
}
