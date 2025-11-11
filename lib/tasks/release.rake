namespace :release do
  desc "Increment version after successful deployment"
  task increment_version: :environment do
    begin
      new_version = Version.increment!
      puts "Version incremented to v#{new_version}"
    rescue => e
      puts "Warning: Failed to increment version: #{e.message}"
      # Don't fail the release if version increment fails
    end
  end
end
