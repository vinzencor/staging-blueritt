# TikTok Trends - Debugging Guide

## 🔍 Issue: Only 1 Product Showing (CETS)

### Symptoms
- Trending section shows only 1 product (CETS)
- Expected: ~60 products from 3 API pages
- Actual: 1 product

### Root Cause Analysis

#### Step 1: Check Backend Logs
When you make a request to the trending endpoint, check the backend logs for:

```
🎯 FRONTEND REQUEST: TikTok Creative Center Trending API called!
📈 TikTok Trending API: country='US', category=, last=7
📋 All query params: {...}
🔧 Fetching 3 pages from API to get ALL available trending products (~60 products)...
📄 Fetching API page 1/3 with params: {...}
📊 API page 1 returned X products, total=Y
```

**What to look for**:
- Is it fetching all 3 pages?
- How many products per page?
- Are products being transformed successfully?

#### Step 2: Check Frontend Console
Open browser DevTools (F12) and check console for:

```javascript
🔄 TikTok Trending Response (ALL products from 3 API pages): {...}
📊 Total products received: X
📊 TikTok Trending - Total Products: X
📊 TikTok Trending - All Products: [...]
📄 Trending Page 1: Showing X products (1-12 of X)
```

**What to look for**:
- How many products in response?
- Are products in the array?
- Is pagination working?

#### Step 3: Check API Response Structure
The API should return:

```json
{
  "data": {
    "products": [
      {
        "id": "...",
        "title": "...",
        "price": "...",
        "likes_count": 0,
        "shares_count": 0,
        "views_count": 0,
        ...
      },
      ...
    ],
    "total": 60,
    "trending_count": 60,
    "api_count": 60,
    "page": 1,
    "limit": 60,
    "total_pages": 5,
    "message": "Found 60 trending products (from 3 API pages)"
  },
  "country": "US"
}
```

### Possible Issues & Solutions

#### Issue 1: API Only Returns 1 Product Per Page
**Symptom**: Backend logs show "API page 1 returned 1 product"

**Solution**:
- Check TikTok Creative Center API documentation
- Verify API key has sufficient quota
- Check if there's a limit parameter being applied

#### Issue 2: Products Not Being Transformed
**Symptom**: Backend logs show "Product X returned None from transform"

**Solution**:
- Check transform_tiktok_product() function
- Verify product data structure from API
- Check for missing required fields

#### Issue 3: Frontend Not Receiving All Products
**Symptom**: Console shows "Total products received: 1"

**Solution**:
- Check API response in Network tab
- Verify response structure matches expected format
- Check if response is being truncated

#### Issue 4: Pagination Issue
**Symptom**: Products exist but pagination shows wrong count

**Solution**:
- Check getCurrentData() function in TikTokTrends.tsx
- Verify slice() is working correctly
- Check currentPage state

### Testing Steps

#### Test 1: Direct API Call
```bash
curl "http://localhost:8000/products/tiktok-trends/trending/?country=US&category=&last=7&order_by=post&order_type=desc&keyword=bestseller"
```

Expected: Should return ~60 products

#### Test 2: Check Network Tab
1. Open DevTools → Network tab
2. Click on trending section
3. Find request to `/products/tiktok-trends/trending/`
4. Check Response tab for product count

#### Test 3: Console Logging
Add this to browser console:

```javascript
// Check trending data
console.log('Trending Data:', window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.(...));

// Or check React Query cache
console.log('React Query Cache:', queryClient.getQueryData(['tiktok-trending', 'US', '', '7', 'post', 'desc']));
```

### Quick Fixes to Try

1. **Clear Cache & Reload**
   - Ctrl+Shift+Delete (clear cache)
   - Reload page

2. **Check API Key**
   - Verify RapidAPI key is valid
   - Check if quota is exceeded

3. **Restart Backend**
   - Restart Django server
   - Check for any errors

4. **Check Filters**
   - Try without category filter
   - Try different time ranges

### Debug Checklist

- [ ] Backend logs show 3 pages being fetched
- [ ] Each page returns multiple products
- [ ] Products are being transformed successfully
- [ ] API response contains all products
- [ ] Frontend receives all products
- [ ] Pagination displays correct count
- [ ] Products render on page

---

**Next Steps**: Run these tests and share the logs/console output for further investigation.

