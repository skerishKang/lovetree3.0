# Media Storage Map

LoveBud pinned at `b1f977fa9aec559597cf2afbadf0600f090f41e7`.

---

## Current Media Architecture

LoveBud does **not** have a dedicated media storage service. All media references are external URLs.

**Status: CONFIRMED**

### Thumbnail Storage

| Field | Storage | Format | Source |
|---|---|---|---|
| memories.thumbnail | PostgreSQL VARCHAR(500) | External URL (typically YouTube thumbnail) | memory_writes.py |
| trees (representative) | Derived at query time | First memory thumbnail via SQL | browse_latest.py |

### YouTube Integration

| Component | Purpose | Source |
|---|---|---|
| `functions/api/youtube/oembed.js` | Proxy YouTube oEmbed API | Cloudflare Pages Function |
| `js/api/public-tree-adapter.js` | Extract YouTube videoId from URLs | Frontend normalization |
| memories.source_url | YouTube video URL | DB column |
| memories.source_type | Always 'youtube' (default) | DB column |
| memories.channel_id | YouTube channel ID | DB column |
| memories.channel_name | YouTube channel display name | DB column |
| memories.channel_url | YouTube channel URL | DB column |

**Status: CONFIRMED**

### YouTube oEmbed Proxy

- Endpoint: `GET /api/youtube/oembed?url=<youtube_url>`
- Purpose: Server-side fetch of YouTube oEmbed data (title, thumbnail_url, html embed)
- Avoids CORS issues when browser fetches YouTube oEmbed directly
- No authentication required
- No DB writes

Source: [functions/api/youtube/oembed.js](https://github.com/skerishKang/LoveBud/blob/b1f977fa9aec559597cf2afbadf0600f090f41e7/functions/api/youtube/oembed.js)

---

## What Does NOT Exist

| Capability | Status | Notes |
|---|---|---|
| File upload endpoint | NOT_IMPLEMENTED | No multipart/form-data handling |
| Image storage (S3/R2/GCS) | NOT_IMPLEMENTED | No bucket references in source |
| Image resize/transcode | NOT_IMPLEMENTED | No image processing |
| Video hosting | NOT_IMPLEMENTED | YouTube-only (external) |
| CDN for user assets | NOT_IMPLEMENTED | No CDN config |
| Avatar/profile image upload | NOT_IMPLEMENTED | Firebase profile photo only |

---

## LoveTree 3.0 Media Requirements

### Current Mock Data

LoveTree 3.0 mock data uses:
- `thumbnailUrl`: placeholder image URLs
- `MediaSearchResult.thumbnailUrl`: search result thumbnails
- No file upload UI exists

### Integration Path

| Need | Solution | Status |
|---|---|---|
| Memory thumbnail | Store YouTube thumbnail URL (from oEmbed or user input) | CONFIRMED (existing contract) |
| Tree representative thumbnail | Derived from first memory (server-side) | CONFIRMED (browse_latest.py) |
| Media search | YouTube oEmbed proxy for metadata | CONFIRMED |
| Custom image upload | No backend support | NOT_IMPLEMENTED |
| Profile avatar | Firebase Auth profile photo (read-only) | CONFIRMED (auth.py) |

---

## Recommendations for LoveTree 3.0

1. **Phase 1:** Use YouTube thumbnail URLs directly (existing contract supports this)
2. **Phase 2:** If custom thumbnails needed, requires new backend endpoint + storage service
3. **No immediate blocker:** All current LoveTree 3.0 screens can function with URL-based thumbnails
