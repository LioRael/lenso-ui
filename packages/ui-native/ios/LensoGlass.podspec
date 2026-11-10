require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'LensoGlass'
  s.version = package['version']
  s.summary = package['description']
  s.license = { :type => 'MIT', :file => '../LICENSE' }
  s.author = 'Lenso contributors'
  s.homepage = 'https://github.com/LioRael/lenso-ui'
  s.source = { :git => 'https://github.com/LioRael/lenso-ui.git' }
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
