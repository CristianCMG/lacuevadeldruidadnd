export interface TokenData {
  access_token: string;
  refresh_token: string;
  user_id: number;
  expires_in: number;
  scope: string;
  token_type: string;
  created_at: number;
}
