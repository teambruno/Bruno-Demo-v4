# Data files

Shared input files for Bruno's data-driven runs. The CLI iterates a request
over every row, injecting each row's columns as variables for that iteration -
one request file, N runs.

| File | Format | Rows |
|---|---|---|
| `req-users.csv` | CSV, header row = variable names | 9 |
| `req-users.json` | JSON array of objects | 9 |

Both hold the same nine rows, so `--csv-file-path` and `--json-file-path` are
interchangeable - useful for showing the feature is not CSV-only.

| name | job |
|---|---|
| John Doe | Software Engineer |
| Jane Smith | Product Manager |
| Mark Lee | Data Scientist |
| Priya Raman | QA Engineer |
| Tomas Herrera | DevOps Engineer |
| Aisha Bello | Security Analyst |
| Wei Zhang | Backend Developer |
| Lena Novak | Technical Writer |
| Samuel Okafor | Solutions Architect |

## Who uses them

| Collection | Folder | Demonstrates |
|---|---|---|
| 02 - Auth and Scripting | `05-Data-Driven` | the feature itself, CSV vs JSON |
| 04 - CLI CI and V4 Features | `01-CLI-Runner-and-Reporters/Runner-DD-Users` | all three reporters off one data-driven run |

They live here rather than beside either folder so there is a single copy of
the rows to edit.

## Paths

The data-file path resolves against the **working directory**, not the
collection root. Demo commands run from a collection root, so they use
`../../data-files/req-users.csv`:

```bash
cd "collections/02 - Auth and Scripting"
bru run "05-Data-Driven" --env Demo-Env \
  --csv-file-path "../../data-files/req-users.csv"
```

`bruno-cli.gitlab-ci.yml` uses the absolute `$CI_PROJECT_DIR/data-files/...`
form instead, because the shared `.bru` job template `cd`s into the collection.

## Reading row values

Interpolate row values into the request (`{{name}}`, `{{job}}`) and assert
against the response. `bru.getVar("name")` returns `undefined` for data-file
rows on the CLI - read them from `req` instead.
