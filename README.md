# DSC-modernization

Spec-driven modernization of the DSC Java application to .NET.

This repository will host the Spec Kit-based spec and the incremental work to port the DSC application from Java to the latest .NET.

Spec kit reference: https://developer.microsoft.com/blog/spec-driven-development-spec-kit

Goals
- Capture a formal specification using the Spec Kit.
- Scaffold a .NET solution (ASP.NET Core where applicable) matching the current app's behavior.
- Migrate persistence to Entity Framework Core and update database artifacts.
- Provide CI that builds and tests the .NET solution.

Database note: The original DSC app uses MySQL (and contains entries for MS SQL). Migration will require schema verification, mapping, and careful credential handling — see `AI/WORKLOG.md` for details.
