## LinkedIn Profile Posts scraper

Our powerful tool helps you gather posts from LinkedIn profiles or companies without compromising security or violating platform policies. Extract full post data, engagement metrics, and additionally scrape reactions and comments. This greatly helps with engagement analysis and outreach purposes.

### Key Benefits

- No cookies or account required: Access profile data without sharing cookies or risking account restrictions
- Low pricing: $2 per 1k posts.
- Fast response times deliver data in seconds 🚀
- No caching, fresh data.
- Concurrency: the actor scrapes 6 profiles/companies at a time.

## How It Works

Simply provide one of the following:

- `targetUrls` List of LinkedIn profile/company URLs who posted or re-posted the content.

Additional content:

- `scrapeReactions` - Enable to scrape reactions to posts. Default is `false`. Reactions will be charged as a separate post and pushed into the dataset. Each post will also contain a nested list of its own reactions.
- `maxReactions` - Maximum number of reactions to scrape per post. If you set this to 0, it will scrape all reactions.
- `scrapeComments` - Enable to scrape comments to posts. Default is `false`. Comments will be charged as a separate post and pushed into the dataset. Each post will also contain a nested list of its own comments.
- `maxComments` - Maximum number of comments to scrape per post. If you set this to 0, it will scrape all comments.

Other params (optionally):

- `maxPosts` - Maximum number of posts to scrape per each search query. This overrides `scrapePages` pagination. If you set this to 0, it will scrape all posts.
- `scrapePages` - Number of pages to scrape, if `maxPosts` is not set. Each page is 20 posts. Posts sorted by date.
- `page` - Page number to start scraping from. Default is 1.

**If you want to search post by text queries or more advanced filters, you can use our Post Search scraper [Linkedin Post Search Scraper](https://apify.com/harvestapi/linkedin-post-search).**

### Data You'll Receive

- Post content
- Author information
- Social engagement metrics
- Media: images, videos, and links
- Content of Re-posts
- Comments and reactions (if enabled, each item will be charged as a separate post)

### Sample output data

Here is the example post output of this actor:

```json
{
  "type": "post",
  "id": "7329207003942125568",
  "linkedinUrl": "https://www.linkedin.com/posts/williamhgates_how-better-data-helped-us-cut-child-mortality-activity-7329207003942125568-_gfJ",
  "content": "The leading causes of childhood death reveal a stark truth: Many could be prevented, and children in poor countries die from them far more often than those in wealthy ones. We have the tools to save lives—and by helping them reach the right children at the right time, the world has cut global child deaths by more than half—from 12 million in 1990 to 4.6 million in 2021. It’s extraordinary progress, but the work isn’t over: https://lnkd.in/gC4pEPsW",
  "author": {
    "universalName": null,
    "publicIdentifier": "williamhgates",
    "type": "profile",
    "name": "Bill Gates",
    "linkedinUrl": "https://www.linkedin.com/in/williamhgates?miniProfileUrn=urn%3Ali%3Afsd_profile%3AACoAAA8BYqEBCGLg_vT_ca6mMEqkpp9nVffJ3hc",
    "info": "Chair, Gates Foundation and Founder, Breakthrough Energy",
    "website": "https://www.linkedin.com/newsletters/gates-notes-6651495472181637121/",
    "websiteLabel": "View my newsletter",
    "avatar": {
      "url": "https://media.licdn.com/dms/image/v2/D5603AQF-RYZP55jmXA/profile-displayphoto-shrink_800_800/B56ZRi8g.aGsAc-/0/1736826818808?e=1753315200&v=beta&t=ot0V86_HfZ7Jk2m6u9RV-vORolb2cJ6Skj5T1FoGlso",
      "width": 800,
      "height": 800,
      "expiresAt": 1753315200000
    }
  },
  "postedAt": {
    "timestamp": 1747419119821,
    "date": "2025-05-16T18:11:59.821Z",
    "postedAgoShort": "6d",
    "postedAgoText": "6 days ago • Visible to anyone on or off LinkedIn"
  },
  "postImages": [],
  "document": {
    "title": " How better data helped us cut child mortality in half",
    "transcribedDocumentUrl": "https://media.licdn.com/dms/document/media/v2/D561FAQGPMwZUeWRF4w/feedshare-document-pdf-analyzed/B56ZbaStGgHgAY-/0/1747419060033?e=1748556000&v=beta&t=LpSrvoiBPULbHs8RDjwayRtdpkRT747P6kZjdHXqWLE",
    "coverPages": [
      {
        "width": 1921,
        "imageUrls": [
          "https://media.licdn.com/dms/image/v2/D561FAQGPMwZUeWRF4w/feedshare-document-cover-images_1920/B56ZbaStGgHgAw-/0/1747419061061?e=1748556000&v=beta&t=xwvy_C8x1NZoKqbC8oIZjo7k2xiZweHkQl0E96zZ_5c",
          "https://media.licdn.com/dms/image/v2/D561FAQGPMwZUeWRF4w/feedshare-document-cover-images_1920/B56ZbaStGgHgAw-/1/1747419061061?e=1748556000&v=beta&t=vT0l9ej-cxGHJ03Fu49ONBjYlswLmpr0R7BUzbFRUu4"
        ],
        "height": 1243
      }
    ],
    "totalPageCount": 2
  },
  "socialContent": {
    "hideCommentsCount": false,
    "hideReactionsCount": false,
    "hideSocialActivityCounts": false,
    "hideShareAction": true,
    "hideSendAction": true,
    "hideRepostsCount": false,
    "hideViewsCount": false,
    "trustInterventionBanner": null,
    "hideReactAction": false,
    "hideCommentAction": false,
    "shareUrl": "https://www.linkedin.com/posts/williamhgates_how-better-data-helped-us-cut-child-mortality-activity-7329207003942125568-_gfJ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAExUClQBdCKsvo8NLfk3HZMfrSLtXnxHlNs",
    "showContributionExperience": false,
    "showSocialDetail": true
  },
  "engagement": {
    "likes": 2916,
    "comments": 328,
    "shares": 153,
    "reactions": [
      {
        "type": "LIKE",
        "count": 2477
      },
      {
        "type": "APPRECIATION",
        "count": 178
      },
      {
        "type": "EMPATHY",
        "count": 158
      },
      {
        "type": "PRAISE",
        "count": 55
      },
      {
        "type": "INTEREST",
        "count": 45
      },
      {
        "type": "ENTERTAINMENT",
        "count": 3
      }
    ]
  },
  "reactions": [
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAADOSyYUBKdykLMCIE5i4B9UDcVsoeXPbwlM,urn:li:ugcPost:7329207002977443840,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAADOSyYUBKdykLMCIE5i4B9UDcVsoeXPbwlM",
        "name": "Rami Sfaxi",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAADOSyYUBKdykLMCIE5i4B9UDcVsoeXPbwlM",
        "position": "Surveillant du patrimoine chez Institut national du patrimoine",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4D03AQGHFY4B_--Xyg/profile-displayphoto-shrink_800_800/B4DZbz5NmeG8Ag-/0/1747848587093?e=1753315200&v=beta&t=C0L4lAIK9nTsUB7XjQCP_qA3MzJk_Mx-IjOxbJ5u3D4",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4D03AQGHFY4B_--Xyg/profile-displayphoto-shrink_800_800/B4DZbz5NmeG8Ag-/0/1747848587093?e=1753315200&v=beta&t=C0L4lAIK9nTsUB7XjQCP_qA3MzJk_Mx-IjOxbJ5u3D4",
          "width": 600,
          "height": 600,
          "expiresAt": 1753315200000
        }
      },
      "postId": "7329207003942125568"
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAAYGWGEB0nr6DlOlf-CBPj1JPE7uNQ3y0mM,urn:li:ugcPost:7329207002977443840,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAAYGWGEB0nr6DlOlf-CBPj1JPE7uNQ3y0mM",
        "name": "Maria Alice",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAAYGWGEB0nr6DlOlf-CBPj1JPE7uNQ3y0mM",
        "position": "Artesã na Artes lee"
      },
      "postId": "7329207003942125568"
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAABW6bB8BkvSx3PhEujHS_FM0oej6OL94CoA,urn:li:ugcPost:7329207002977443840,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAABW6bB8BkvSx3PhEujHS_FM0oej6OL94CoA",
        "name": "Aytekin A.",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAABW6bB8BkvSx3PhEujHS_FM0oej6OL94CoA",
        "position": "--"
      },
      "postId": "7329207003942125568"
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAAMHAagBPz-UgeRDsX3klfoVZEkDw1ulS7E,urn:li:ugcPost:7329207002977443840,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAAMHAagBPz-UgeRDsX3klfoVZEkDw1ulS7E",
        "name": "Gangotri Dey (Ph.D)",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAAMHAagBPz-UgeRDsX3klfoVZEkDw1ulS7E",
        "position": "Licensing Officer | Intellectual Property | Patents | Technology Transfer | Egalitarian | Numismatist",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4E03AQGDj6wx_xJbRQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1668631616852?e=1753315200&v=beta&t=12ishzrb2wqXHERve9a-wNaL4_V6H6a2rA76UYX5MWI",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4E03AQGDj6wx_xJbRQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1668631616852?e=1753315200&v=beta&t=12ishzrb2wqXHERve9a-wNaL4_V6H6a2rA76UYX5MWI",
          "width": 594,
          "height": 594,
          "expiresAt": 1753315200000
        }
      },
      "postId": "7329207003942125568"
    },
    {
      "id": "urn:li:fsd_reaction:(urn:li:fsd_profile:ACoAAEfKTEoB1SpCcTCSs2df5663HhAYI92kxGk,urn:li:ugcPost:7329207002977443840,0)",
      "reactionType": "LIKE",
      "actor": {
        "id": "ACoAAEfKTEoB1SpCcTCSs2df5663HhAYI92kxGk",
        "name": "Ola Majowicz",
        "linkedinUrl": "https://www.linkedin.com/in/ACoAAEfKTEoB1SpCcTCSs2df5663HhAYI92kxGk",
        "position": "--",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4D03AQEFOMjXAUyFXg/profile-displayphoto-shrink_800_800/B4DZbx0SuSGYAg-/0/1747813740226?e=1753315200&v=beta&t=MMPxVrIT6Wl3w_2S8brX_UhiE6Ot6cd-pYsViN5lrBA",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4D03AQEFOMjXAUyFXg/profile-displayphoto-shrink_800_800/B4DZbx0SuSGYAg-/0/1747813740226?e=1753315200&v=beta&t=MMPxVrIT6Wl3w_2S8brX_UhiE6Ot6cd-pYsViN5lrBA",
          "width": 800,
          "height": 800,
          "expiresAt": 1753315200000
        }
      },
      "postId": "7329207003942125568"
    }
  ],
  "comments": [
    {
      "id": "7331415234328371202",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329207002977443840?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7329207002977443840%2C7331415234328371202%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331415234328371202%2Curn%3Ali%3AugcPost%3A7329207002977443840%29",
      "commentary": "I respect what you do and I am wondering what to do with someone that is like me and suffers daily from flash backs, nightmares etc.. from tragedy experienced at a young age and no one my whole life really understands or ever has...the tragedy I  experienced at a young age. As time goes on no healing has taken place instead I seem to get more haunted by what took place and how I've been told my whole life hush hush because of ones reputation",
      "createdAt": "2025-05-22T20:26:42.973Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [],
      "actor": {
        "id": "ACoAAFqw9EoBBFnIY4WwvqjI-qhUrd706E8qRc0",
        "name": "Justin Martin",
        "linkedinUrl": "https://www.linkedin.com/in/justin-martin-5a2690365",
        "position": "Handy man at QUALITY HOUSE SERVICES",
        "author": false
      },
      "createdAtTimestamp": 1747945602973,
      "pinned": false,
      "contributed": false,
      "edited": false,
      "postId": "7329207003942125568"
    },
    {
      "id": "7331359556641423361",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329207002977443840?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7329207002977443840%2C7331359556641423361%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331359556641423361%2Curn%3Ali%3AugcPost%3A7329207002977443840%29",
      "commentary": "Great",
      "createdAt": "2025-05-22T16:45:28.377Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [],
      "actor": {
        "id": "ACoAADz09WkBpEUBFAtJBq2jScZ2o2jnW5qlTPI",
        "name": "Emma Chen",
        "linkedinUrl": "https://www.linkedin.com/in/emma-chen-6095b4246",
        "position": "Medical Educators & Clinicians | Cardiology & Interdisciplinary Research",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4E03AQF_jEhahaIAhg/profile-displayphoto-shrink_800_800/B4EZb114gmHcAc-/0/1747881266030?e=1753315200&v=beta&t=dV0BPggfyhUD3JmnKsp1a8gy1sZfOapE-AJVRJSqOgA",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4E03AQF_jEhahaIAhg/profile-displayphoto-shrink_800_800/B4EZb114gmHcAc-/0/1747881266030?e=1753315200&v=beta&t=dV0BPggfyhUD3JmnKsp1a8gy1sZfOapE-AJVRJSqOgA",
          "width": 800,
          "height": 800,
          "expiresAt": 1753315200000
        },
        "author": false
      },
      "createdAtTimestamp": 1747932328377,
      "pinned": false,
      "contributed": false,
      "edited": false,
      "postId": "7329207003942125568"
    },
    {
      "id": "7331340543228080128",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329207002977443840?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7329207002977443840%2C7331340543228080128%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331340543228080128%2Curn%3Ali%3AugcPost%3A7329207002977443840%29",
      "commentary": "Behind this number is the victory of vaccines, mosquito nets and oral rehydration salts! But the slowdown of the curve in 2022 shows that the last mile is the most difficult to break through: children with malaria in rural Congo still die 30 kilometers away from the clinic. Should we switch to a hybrid model of community health workers + drone delivery?",
      "createdAt": "2025-05-22T15:29:55.227Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [],
      "actor": {
        "id": "ACoAAEXX2lABxdO9E5hnkDcuJBG7a_htTSOWWuU",
        "name": "Kayla A.",
        "linkedinUrl": "https://www.linkedin.com/in/kayla-a-b80511288",
        "position": "Board Member | Technical Partner | Biopharmaceutical Process Development Specialist|",
        "author": false
      },
      "createdAtTimestamp": 1747927795227,
      "pinned": false,
      "contributed": false,
      "edited": false,
      "postId": "7329207003942125568"
    },
    {
      "id": "7331286926336880640",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329207002977443840?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7329207002977443840%2C7331286926336880640%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331286926336880640%2Curn%3Ali%3AugcPost%3A7329207002977443840%29",
      "commentary": "That's a shame",
      "createdAt": "2025-05-22T11:56:51.964Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [],
      "actor": {
        "id": "ACoAAE6YC-cBBohkYnLf-Svpr4nYwh3nRmzb24E",
        "name": "Sean Obrien",
        "linkedinUrl": "https://www.linkedin.com/in/sean-obrien-487713309",
        "position": "--",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4E03AQG84nzQLEoquQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1715775686297?e=1753315200&v=beta&t=1k27We_BcV2rmkYyCF6OdRxa8LFTidsFkrVdIY87i4U",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4E03AQG84nzQLEoquQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1715775686297?e=1753315200&v=beta&t=1k27We_BcV2rmkYyCF6OdRxa8LFTidsFkrVdIY87i4U",
          "width": 96,
          "height": 96,
          "expiresAt": 1753315200000
        },
        "author": false
      },
      "createdAtTimestamp": 1747915011964,
      "pinned": false,
      "contributed": false,
      "edited": false,
      "postId": "7329207003942125568"
    },
    {
      "id": "7331248243730788352",
      "linkedinUrl": "https://www.linkedin.com/feed/update/urn:li:ugcPost:7329207002977443840?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7329207002977443840%2C7331248243730788352%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287331248243730788352%2Curn%3Ali%3AugcPost%3A7329207002977443840%29",
      "commentary": "How many children have died for the COVID-19 vaccine bill? Any idea?",
      "createdAt": "2025-05-22T09:23:09.312Z",
      "numComments": 0,
      "numShares": null,
      "numImpressions": null,
      "reactionTypeCounts": [],
      "actor": {
        "id": "ACoAAE256KAB2cvk6PEP_3CkxPGIidaWX3ezpDo",
        "name": "Gregg Kozuchowski",
        "linkedinUrl": "https://www.linkedin.com/in/gregg-kozuchowski-740872304",
        "position": "--",
        "pictureUrl": "https://media.licdn.com/dms/image/v2/D4D03AQGpj-eks2D_3w/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1713394281782?e=1753315200&v=beta&t=0_w-AuM5KnyoOv2xs0oZdut48W6B9jqtc2DoBKwnFik",
        "picture": {
          "url": "https://media.licdn.com/dms/image/v2/D4D03AQGpj-eks2D_3w/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1713394281782?e=1753315200&v=beta&t=0_w-AuM5KnyoOv2xs0oZdut48W6B9jqtc2DoBKwnFik",
          "width": 96,
          "height": 96,
          "expiresAt": 1753315200000
        },
        "author": false
      },
      "createdAtTimestamp": 1747905789312,
      "pinned": false,
      "contributed": false,
      "edited": false,
      "postId": "7329207003942125568"
    }
  ]
}
```

## Linkedin Profile Post API

The actor stores results in a dataset. You can export data in various formats such as CSV, JSON, XLS, etc. You can scrape and access data on demand using API.

### Support and Feedback

We continuously enhance our tools based on user feedback. If you encounter technical issues or have suggestions for improvement:

- Create an issue on the actor’s Issues tab in Apify Console
- Chat with us on our [Discord server](https://discord.gg/TGA9k9u2gE)
- Or contact us at contact@harvest-api.com
