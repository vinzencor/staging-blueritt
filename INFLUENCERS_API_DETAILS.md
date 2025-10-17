# Top Influencers API Integration Details

## API Endpoint

```
GET https://real-time-amazon-data.p.rapidapi.com/influencer-profile
```

## Request Headers

```javascript
{
  'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
  'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
}
```

## Query Parameters

| Parameter | Type | Required | Default | Example |
|-----------|------|----------|---------|---------|
| `influencer_name` | string | Yes | - | `kylerichards18` |
| `country` | string | No | `US` | `US` |

## Influencer Names

The widget fetches data for these 9 influencers:

```javascript
const INFLUENCER_NAMES = [
  'kylerichards18',
  'paige_desorbo',
  'jdroberto',
  'kandionline',
  'makhondlovu',
  '_giagiudice',
  'madison.lecroy',
  'lalakent',
  'harryjowsey'
];
```

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    "influencer_name": "kylerichards18",
    "followers": "1.2M",
    "following": "500",
    "post_count": "2,345",
    "engagement_rate": 4.5,
    "bio": "Real Housewife | Entrepreneur",
    "verified": true,
    "profile_image": "https://...",
    "follower_count": "1200000",
    "following_count": "500",
    "post_count": "2345"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Influencer not found"
}
```

## Implementation Code

### Fetch Function
```typescript
export const getInfluencerProfile = async (
  influencerName: string, 
  country: string = 'US'
): Promise<InfluencerResponse> => {
  try {
    const response = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/influencer-profile?influencer_name=${influencerName}&country=${country}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      status: 'success',
      data: data.data || data
    };
  } catch (error) {
    console.error(`Error fetching influencer ${influencerName}:`, error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
```

### Batch Fetch Function
```typescript
export const getTopInfluencers = async (
  country: string = 'US'
): Promise<Influencer[]> => {
  const influencerNames = [
    'kylerichards18',
    'paige_desorbo',
    'jdroberto',
    'kandionline',
    'makhondlovu',
    '_giagiudice',
    'madison.lecroy',
    'lalakent',
    'harryjowsey'
  ];

  try {
    // Fetch all influencers in parallel
    const promises = influencerNames.map(name => 
      getInfluencerProfile(name, country)
    );
    const results = await Promise.all(promises);
    
    // Filter successful responses
    return results
      .filter(result => result.status === 'success' && result.data)
      .map(result => ({
        ...result.data,
        influencer_name: result.data?.influencer_name || ''
      }));
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return [];
  }
};
```

## Data Flow

```
1. Component Mounts
   ↓
2. useEffect triggers
   ↓
3. Call getTopInfluencers()
   ↓
4. Parallel fetch all 9 influencers
   ↓
5. Filter successful responses
   ↓
6. Update state with influencer data
   ↓
7. Render InfluencerCards
```

## Error Handling

- **Network Error**: Caught and logged, returns empty array
- **Individual Influencer Fails**: Continues with other influencers
- **API Rate Limit**: Handled gracefully with error message
- **Invalid Response**: Filters out and continues

## Performance Optimization

- **Parallel Requests**: Uses `Promise.all()` for concurrent fetching
- **Error Resilience**: One failed request doesn't block others
- **Lazy Loading**: Only fetches when component mounts
- **Memoization**: Uses `useMemo` for expensive operations

## Quota Management

- Each influencer profile fetch = 1 API call
- Total calls per load = 9 (one per influencer)
- Recommended: Monitor API quota usage
- Consider caching if quota is limited

## Testing the API

### cURL Example
```bash
curl --request GET \
  --url 'https://real-time-amazon-data.p.rapidapi.com/influencer-profile?influencer_name=kylerichards18&country=US' \
  --header 'x-rapidapi-host: real-time-amazon-data.p.rapidapi.com' \
  --header 'x-rapidapi-key: 60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
```

### JavaScript Example
```javascript
const response = await fetch(
  'https://real-time-amazon-data.p.rapidapi.com/influencer-profile?influencer_name=kylerichards18&country=US',
  {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'x-rapidapi-key': '60cb7bd196mshfa4299228d59ae3p16cdb0jsn5bf954e1e4a5'
    }
  }
);
const data = await response.json();
console.log(data);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check API key is correct |
| 429 Too Many Requests | API quota exceeded, wait or upgrade |
| 404 Not Found | Influencer name doesn't exist |
| Empty response | API returned no data for influencer |
| Network timeout | Check internet connection |

---

**Last Updated**: 2025-10-17
**API Status**: ✅ Active
**Integration Status**: ✅ Complete

