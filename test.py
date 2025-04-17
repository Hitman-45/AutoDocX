from tree_sitter import Language

Language.build_library(
  'build/java.so',
  ['tree-sitter-java']
)