export interface AuthorNode {
  id: string;
  userName: string;
  displayName: string;
  name: string;
  foreignId: string;
  bot: boolean | null;
  pagerank: number;
  community: number;
}
