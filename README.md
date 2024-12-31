# README

## Summary
This is a personal project I am working on. It helps me with my daily standard of work.

### Version History

#### Version 1.01
- Added the ability to upload a logo.

#### Version 1.02
- Made the remove button persistent.

#### Version 1.03 (Current)
- Fixed unclosed `<tr>` tag in the hours tracker table.
- Added debug logs to monitor key operations (form submissions, table updates, localStorage interactions).
- Updated the `exportHoursDataToExcel` function to handle special characters in cell data properly.
- Added accessibility enhancements with ARIA labels for form inputs.
- Ensured remove button persistency by refreshing data models after deletion.

#### Version 1.04 (Current)
- Introduced the "Product Profiler Tool" tab for extracting specific sections from uploaded PDFs.
- Integrated PDF.js to parse and extract sections 1, 2, 3, 9, 10, 13, and 14 from PDF files.
- Added error handling for unsupported file types and missing sections in PDFs.
- Improved debug logging to trace PDF processing and tab switching.
- Updated `index.html`, `profiler.js`, and `style.css` to support the new feature.
